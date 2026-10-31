// Local Imports
import { LEVEL_HEIGHT, MAP_HEIGHT, MAP_WIDTH, MIN_LEVEL, STEP_UP } from './dimensions';
import {
  CARDINAL_DIRS,
  MAX_TURN_CODE,
  RAMPS,
  RAMP_DIRS,
} from './ramps';
import { TILE_BY_CHAR } from './tile-codec';
import { TileGrid } from './tile-grid';
import { PASSABLE } from './tiles';

// Types
import type { Tile } from './tiles';

/**
 * The mutable tile grid plus the terrain level under each tile. The server
 * owns the real one and drains its tile changes each tick; displays keep a
 * mirror and use the same changes as a rebuild signal. Levels come from the
 * generator (or a preset) and only change in the map editor, which resends
 * the whole map. Stairs can be turned to climb a set way (`ramps`: 0 picks
 * the way by itself, else 1 + an index into RAMP_DIRS); walls keep a way
 * and a look the same way (see `turnCode`).
 *
 * Storage and encoding live in `TileGrid`; this class adds the factories
 * and the height geometry walkers move over.
 */
export class WorldMap extends TileGrid {
  /**
   * Wraps the given storage (use `filled` or `decode`).
   * @param width Tiles across.
   * @param height Tiles down.
   * @param tiles Every tile, row-major.
   * @param levels Every tile's terrain level, row-major.
   * @param ramps Every tile's turn, row-major (none turned unless given).
   */
  private constructor(width: number, height: number, tiles: Tile[], levels: Int8Array, ramps?: Int8Array) {
    super(width, height, tiles, levels, ramps);
  }

  /**
   * A flat map filled with one tile (the classic size unless told).
   * @param tile The tile everywhere.
   * @param width Tiles across.
   * @param height Tiles down.
   * @returns The new map, all at the ground level.
   */
  static filled(tile: Tile, width = MAP_WIDTH, height = MAP_HEIGHT): WorldMap {
    return new WorldMap(width, height, Array.from({ length: width * height }, (): Tile => tile), new Int8Array(width * height));
  }

  /**
   * A map made from its raw cells, row-major (as a save's chunks rebuild
   * it).
   * @param width Tiles across.
   * @param height Tiles down.
   * @param tiles Every tile.
   * @param levels Every terrain level.
   * @param ramps Every turn code (see `TileGrid.rampAt`).
   * @returns The map.
   */
  static fromCells(width: number, height: number, tiles: Tile[], levels: Int8Array, ramps: Int8Array): WorldMap {
    return new WorldMap(width, height, tiles, levels, ramps);
  }

  /**
   * Parses an encoded map and its levels `width` tiles across (the height
   * follows from the length), or null if they don't fit together.
   * @param encoded One character per tile (see `encode`).
   * @param levels One digit per tile (see `encodeLevels`).
   * @param ramps One base-36 digit per tile (see `encodeRamps`), if saved.
   * @param width Tiles across.
   * @returns The map, or null when the parts don't fit or a tile is unknown.
   */
  static decode(encoded: string, levels: string, ramps?: string, width = MAP_WIDTH): WorldMap | null {
    const height = encoded.length / width;
    if (!Number.isInteger(height) || height < 1 || levels.length !== encoded.length) {
      return null;
    }
    const tiles = [...encoded].map((ch: string): Tile | undefined => TILE_BY_CHAR[ch]);
    const heights = Int8Array.from([...levels], (ch: string): number => Number(ch) + MIN_LEVEL);
    const turns = ramps?.length === encoded.length
      ? Int8Array.from([...ramps], (ch: string): number => Math.min(MAX_TURN_CODE, Math.max(0, parseInt(ch, 36) || 0)))
      : undefined;
    return tiles.every(Boolean) ? new WorldMap(width, height, tiles as Tile[], heights, turns) : null;
  }

  /**
   * Height of a tile's floor (the low end of a ramp; a built platform's
   * deck is a level up).
   * @param tx Tile column.
   * @param ty Tile row.
   * @returns The floor height in world units.
   */
  base(tx: number, ty: number): number {
    return (this.level(tx, ty) + (this.get(tx, ty) === 'platform' ? 1 : 0)) * LEVEL_HEIGHT;
  }

  /**
   * Which way a ramp climbs: toward its highest open neighbor above it,
   * preferring one with open floor behind (so side by side stairs climb
   * together instead of into each other), or null when it isn't a ramp or
   * leads nowhere higher.
   * @param tx Tile column.
   * @param ty Tile row.
   * @returns The step toward the high end, or null.
   */
  rampUp(tx: number, ty: number): [number, number] | null {
    if (!RAMPS.has(this.get(tx, ty))) {
      return null;
    }
    const own = this.base(tx, ty);
    const turned = this._ramps[ty * this.width + tx];
    if (turned > 0) {
      const [dx, dy] = RAMP_DIRS[(turned - 1) % RAMP_DIRS.length];
      if (!this.isSolid(tx + dx, ty + dy) && this.base(tx + dx, ty + dy) > own) {
        return [dx, dy];
      }
    }
    let best: [number, number] | null = null;
    let bestBase = own + 0.01;
    let bestFoot = false;
    for (const [dx, dy] of CARDINAL_DIRS) {
      const b = this.base(tx + dx, ty + dy);
      if (this.isSolid(tx + dx, ty + dy) || b < bestBase) {
        continue;
      }
      const foot = this.isFoot(tx - dx, ty - dy, own);
      if (b > bestBase || (foot && !bestFoot)) {
        best = [dx, dy];
        bestBase = b;
        bestFoot = foot;
      }
    }
    return best;
  }

  /**
   * Whether a tile is open, flat floor at a given height: what the foot of
   * a ramp should be.
   * @param tx Tile column.
   * @param ty Tile row.
   * @param height The floor height it should have.
   * @returns True when it's open, not a ramp, and at that height.
   */
  isFoot(tx: number, ty: number, height: number): boolean {
    return !this.isSolid(tx, ty) && !RAMPS.has(this.get(tx, ty)) && this.base(tx, ty) === height;
  }

  /**
   * Height of a tile's highest point (the top of a ramp).
   * @param tx Tile column.
   * @param ty Tile row.
   * @returns The top height in world units.
   */
  top(tx: number, ty: number): number {
    const up = this.rampUp(tx, ty);
    return up ? this.base(tx + up[0], ty + up[1]) : this.base(tx, ty);
  }

  /**
   * Ground height under a tile-space point, rising smoothly along ramps.
   * @param x Tile-space x.
   * @param y Tile-space y.
   * @returns The ground height in world units.
   */
  elevationAt(x: number, y: number): number {
    const tx = Math.floor(x);
    const ty = Math.floor(y);
    const up = this.rampUp(tx, ty);
    const base = this.base(tx, ty);
    if (!up) {
      return base;
    }
    const fx = x - tx;
    const fy = y - ty;
    const t = up[0] === 1 ? fx : up[0] === -1 ? 1 - fx : up[1] === 1 ? fy : 1 - fy;
    return base + (this.top(tx, ty) - base) * t;
  }

  /**
   * Whether a walker can move from tile a to its neighbor b: b must be
   * open and no more than a step above where a walker leaves a from: the
   * top of stairs going the way they climb, else their middle (walkers go
   * from tile middle to tile middle, so they can't step off the high end
   * sideways).
   * @param ax Column of the tile left.
   * @param ay Row of the tile left.
   * @param bx Column of the neighbor entered.
   * @param by Row of the neighbor entered.
   * @returns True when the step is allowed.
   */
  canStep(ax: number, ay: number, bx: number, by: number): boolean {
    const up = this.rampUp(ax, ay);
    const from = !up || (up[0] === bx - ax && up[1] === by - ay) ? this.top(ax, ay) : (this.base(ax, ay) + this.top(ax, ay)) / 2;
    return (!this.isSolid(bx, by) || PASSABLE.has(this.get(bx, by))) && this.base(bx, by) <= from + STEP_UP;
  }

  /**
   * Marks (with 1) every tile a walker can get to from one of `starts` and
   * also get back from.
   * @param starts Tile-space points to search from.
   * @returns One byte per tile, row-major: 1 where there and back works.
   */
  roundTrip(starts: { x: number; y: number }[]): Uint8Array {
    /**
     * Floods from the starts, one way.
     * @param forward True to follow steps out from the starts, false to follow them back in.
     * @returns One byte per tile, row-major: 1 where reached.
     */
    const search = (forward: boolean): Uint8Array => {
      const seen = new Uint8Array(this.width * this.height);
      const queue: number[] = [];
      for (const s of starts) {
        const i = Math.floor(s.y) * this.width + Math.floor(s.x);
        if (!seen[i]) {
          seen[i] = 1;
          queue.push(i);
        }
      }
      for (let head = 0; head < queue.length; head++) {
        const tx = queue[head] % this.width;
        const ty = Math.floor(queue[head] / this.width);
        for (const [dx, dy] of CARDINAL_DIRS) {
          const nx = tx + dx;
          const ny = ty + dy;
          const n = ny * this.width + nx;
          if (nx < 0 || ny < 0 || nx >= this.width || ny >= this.height || seen[n]) {
            continue;
          }
          if (forward ? this.canStep(tx, ty, nx, ny) : this.canStep(nx, ny, tx, ty)) {
            seen[n] = 1;
            queue.push(n);
          }
        }
      }
      return seen;
    };
    const there = search(true);
    const back = search(false);
    return there.map((v: number, i: number): number => v & back[i]);
  }
}
