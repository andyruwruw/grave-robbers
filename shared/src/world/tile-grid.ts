// Local Imports
import { MAP_HEIGHT, MAP_WIDTH, MAX_LEVEL, MIN_LEVEL } from './dimensions';
import { KEEPS_TURN, RAMP_DIRS } from './ramps';
import { CHAR_BY_TILE } from './tile-codec';
import { isSolidTile } from './tiles';

// Types
import type { Tile, TileChange } from './tiles';

/**
 * The storage half of a map: the mutable tile grid, the terrain level and
 * turn under each tile, the wire encoding, and the tiles changed since the
 * last drain. `WorldMap` adds the height geometry on top.
 */
export abstract class TileGrid {
  /**
   * Every tile, row-major.
   */
  protected _tiles: Tile[];

  /**
   * Every tile's terrain level, row-major.
   */
  protected _levels: Int8Array;

  /**
   * Every tile's turn, row-major: 0 for none (stairs choose for
   * themselves), else 1 + an index into RAMP_DIRS.
   */
  protected _ramps: Int8Array;

  /**
   * Indexes of the tiles changed since the last `takeChanges`.
   */
  protected _changed = new Set<number>();

  /**
   * Tiles across.
   */
  readonly width: number;

  /**
   * Tiles down.
   */
  readonly height: number;

  /**
   * How many tiles there are (width times height).
   */
  readonly size: number;

  /**
   * What lies past the map's edge: the classic map's fence, or the chasm
   * around anything bigger.
   */
  readonly edge: Tile;

  /**
   * Wraps the given storage.
   * @param width Tiles across.
   * @param height Tiles down.
   * @param tiles Every tile, row-major.
   * @param levels Every tile's terrain level, row-major.
   * @param ramps Every tile's turn, row-major (none turned unless given).
   */
  protected constructor(width: number, height: number, tiles: Tile[], levels: Int8Array, ramps: Int8Array = new Int8Array(width * height)) {
    this.width = width;
    this.height = height;
    this.size = width * height;
    this.edge = width > MAP_WIDTH || height > MAP_HEIGHT ? 'chasm' : 'fence';
    this._tiles = tiles;
    this._levels = levels;
    this._ramps = ramps;
  }

  /**
   * Whether a tile is on the map.
   * @param tx Tile column.
   * @param ty Tile row.
   * @returns True when (tx, ty) is inside the grid.
   */
  inBounds(tx: number, ty: number): boolean {
    return tx >= 0 && ty >= 0 && tx < this.width && ty < this.height;
  }

  /**
   * A tile's row-major index (ty * width + tx).
   * @param tx Tile column.
   * @param ty Tile row.
   * @returns The index.
   */
  index(tx: number, ty: number): number {
    return ty * this.width + tx;
  }

  /**
   * One digit per tile: which way stairs there were turned (0 for their own
   * choice).
   * @returns The encoded turns.
   */
  encodeRamps(): string {
    return this._ramps.join('');
  }

  /**
   * Turns the stairs on a tile to climb `dir` (an index into RAMP_DIRS), or
   * back to choosing for themselves (null).
   * @param tx Tile column.
   * @param ty Tile row.
   * @param dir An index into RAMP_DIRS, or null to clear the turn.
   */
  setRamp(tx: number, ty: number, dir: number | null): void {
    if (tx >= 0 && ty >= 0 && tx < this.width && ty < this.height) {
      this._ramps[ty * this.width + tx] = dir === null ? 0 : dir + 1;
      this._changed.add(ty * this.width + tx);
    }
  }

  /**
   * One character per tile (see CHAR_BY_TILE), for saves and wire messages.
   * @returns The encoded tiles.
   */
  encode(): string {
    return this._tiles.map((t: Tile): string => CHAR_BY_TILE[t]).join('');
  }

  /**
   * One digit per tile: its level minus MIN_LEVEL.
   * @returns The encoded levels.
   */
  encodeLevels(): string {
    return Array.from(this._levels, (l: number): string => String(l - MIN_LEVEL)).join('');
  }

  /**
   * The terrain level of a tile. Off-map reads as the ground.
   * @param tx Tile column.
   * @param ty Tile row.
   * @returns The level, MIN_LEVEL to MAX_LEVEL.
   */
  level(tx: number, ty: number): number {
    if (tx < 0 || ty < 0 || tx >= this.width || ty >= this.height) {
      return 0;
    }
    return this._levels[ty * this.width + tx];
  }

  /**
   * Sets a tile's terrain level (generation and the map editor; not sent
   * as a change).
   * @param tx Tile column.
   * @param ty Tile row.
   * @param level The new level, clamped to MIN_LEVEL..MAX_LEVEL.
   */
  setLevel(tx: number, ty: number, level: number): void {
    if (tx >= 0 && ty >= 0 && tx < this.width && ty < this.height) {
      this._levels[ty * this.width + tx] = Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, level));
    }
  }

  /**
   * Which way a turned tile (a conveyor belt) was set, or null.
   * @param tx Tile column.
   * @param ty Tile row.
   * @returns The direction from RAMP_DIRS, or null when not turned.
   */
  turnOf(tx: number, ty: number): [number, number] | null {
    const turned = this.inBounds(tx, ty) ? this._ramps[ty * this.width + tx] : 0;
    return turned > 0 ? RAMP_DIRS[turned - 1] : null;
  }

  /**
   * The tile at integer coordinates. Off-map reads as `edge`.
   * @param tx Tile column.
   * @param ty Tile row.
   * @returns The tile there.
   */
  get(tx: number, ty: number): Tile {
    if (tx < 0 || ty < 0 || tx >= this.width || ty >= this.height) {
      return this.edge;
    }
    return this._tiles[ty * this.width + tx];
  }

  /**
   * Puts a tile on the map, recording the change, and clears the turn of
   * a tile that doesn't keep one. Off-map does nothing.
   * @param tx Tile column.
   * @param ty Tile row.
   * @param tile The new tile.
   */
  set(tx: number, ty: number, tile: Tile): void {
    if (tx < 0 || ty < 0 || tx >= this.width || ty >= this.height) {
      return;
    }
    const i = ty * this.width + tx;
    if (this._tiles[i] !== tile) {
      this._tiles[i] = tile;
      this._changed.add(i);
      if (!KEEPS_TURN.has(tile)) {
        this._ramps[i] = 0;
      }
    }
  }

  /**
   * Applies tile changes from the server (a display's mirror).
   * @param changes The changed tiles, with their turns.
   */
  apply(changes: TileChange[]): void {
    for (const { i, tile, turn } of changes) {
      this.set(i % this.width, Math.floor(i / this.width), tile);
      if (turn !== undefined) {
        this._ramps[i] = turn;
      }
    }
  }

  /**
   * Returns and clears the tiles changed since the last call.
   * @returns The changed tiles, with turns for tiles that keep one.
   */
  takeChanges(): TileChange[] {
    const changes = [...this._changed].map((i: number): TileChange => (KEEPS_TURN.has(this._tiles[i]) ? { i, tile: this._tiles[i], turn: this._ramps[i] } : { i, tile: this._tiles[i] }));
    this._changed.clear();
    return changes;
  }

  /**
   * Whether the tile at integer coordinates blocks players.
   * @param tx Tile column.
   * @param ty Tile row.
   * @returns True for a solid tile (off-map is the solid edge).
   */
  isSolid(tx: number, ty: number): boolean {
    return isSolidTile(this.get(tx, ty));
  }

  /**
   * Tile-center positions of every spawn tile.
   * @returns The spawn points, in row-major order.
   */
  spawnPoints(): { x: number; y: number }[] {
    return this._tiles.flatMap((t: Tile, i: number) =>
      t === 'spawn' ? [{ x: (i % this.width) + 0.5, y: Math.floor(i / this.width) + 0.5 }] : [],
    );
  }
}
