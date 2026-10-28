// Types
import type { StructureKind } from './structures';

/**
 * Every tile kind on the map, including player-built structures.
 *
 * - Ground: `grass`, `path` (dirt), `cobble`, `flagstone` (chapel floor),
 *   `spawn` (looks like path), `stairs` (stone steps up to the next level),
 *   `mound` (a dug-up grave; a new gravestone rises from it in time).
 * - Landmarks: `crypt`, `mausoleum`, `ruin` (broken chapel wall), `well`,
 *   `statue`, `lamp` (permanent light), `tower` (the watchtower's walls).
 *
 * How high each tile sits is kept apart from its kind: see `WorldMap.level`.
 * - Nature and graves: `tree`, `stump` (rots away), `rock`, `hedge`,
 *   `tombstone`, `cross`, `pumpkin`, and the outer `fence`.
 * - `chest`: turns up now and then, full of loot.
 */
export type Tile =
  | 'fence' | 'tombstone' | 'cross' | 'tree' | 'stump' | 'rock' | 'pumpkin' | 'chest' | 'crypt'
  | 'grass' | 'path' | 'spawn' | 'cobble' | 'flagstone' | 'stairs' | 'mound'
  | 'mausoleum' | 'ruin' | 'well' | 'statue' | 'lamp' | 'tower' | 'hedge'
  | StructureKind;

/**
 * One character per tile, for compact saves and wire messages.
 */
const CHAR_BY_TILE: Record<Tile, string> = {
  fence: '#',
  tombstone: 'T',
  cross: '+',
  tree: 'D',
  stump: 'u',
  rock: 'R',
  pumpkin: 'P',
  chest: 'K',
  crypt: 'C',
  grass: '.',
  path: ',',
  spawn: 's',
  cobble: 'c',
  flagstone: 'g',
  stairs: '=',
  mound: 'm',
  mausoleum: 'M',
  ruin: 'r',
  well: 'o',
  statue: 'A',
  lamp: 'L',
  tower: 'Y',
  hedge: 'h',
  'wood-wall': 'w',
  'stone-wall': 'W',
  'door': 'd',
  'spikes': 'x',
  'torch': 't',
  'campfire': 'f',
  'wood-fence': 'n',
  'lantern': 'l',
  'scarecrow': 'S',
  'platform': 'b',
  'steps': 'z',
  'palisade': 'p',
  'research-table': 'e',
  'sawmill': 'Z',
  'furnace': 'F',
  'altar': 'a',
  'bloodforge': 'B',
  'sifter': 'v',
  'sentry': 'G',
  'digger': 'k',
  'bone-wall': 'O',
  'coffin': 'q',
  'bell': 'i',
  'cauldron': 'U',
  'iron-spikes': 'X',
  'barbed-wire': 'V',
  'ghost-lamp': 'y',
  'soul-fire': 'j',
  'effigy': 'E',
  'obelisk': 'H',
  'blood-fountain': 'I',
  'soul-cage': 'J',
  'mirror': 'N',
};

const TILE_BY_CHAR = Object.fromEntries(
  Object.entries(CHAR_BY_TILE).map(([tile, ch]) => [ch, tile as Tile]),
) as Record<string, Tile>;

/**
 * Tiles players can't walk through. Doors and spikes are open to players;
 * monsters get their own rules.
 */
const SOLID: ReadonlySet<Tile> = new Set<Tile>([
  'fence', 'tombstone', 'cross', 'tree', 'rock', 'pumpkin', 'chest', 'crypt',
  'mausoleum', 'ruin', 'well', 'statue', 'lamp', 'tower', 'hedge',
  'wood-wall', 'stone-wall', 'torch', 'campfire', 'wood-fence', 'lantern', 'scarecrow', 'ghost-lamp', 'soul-fire', 'effigy', 'obelisk', 'blood-fountain', 'soul-cage', 'mirror',
  'palisade', 'research-table', 'sawmill', 'furnace',
  'altar', 'bloodforge', 'sifter', 'sentry', 'digger', 'bone-wall', 'coffin', 'bell', 'cauldron',
]);

/**
 * Whether a tile kind blocks players.
 */
export function isSolidTile(tile: Tile): boolean {
  return SOLID.has(tile);
}

/**
 * Solid tiles walkers can push through anyway (slowly): trees.
 */
export const PASSABLE: ReadonlySet<Tile> = new Set<Tile>(['tree']);

/**
 * How far from a tree's center its branches slow walkers down: past half a
 * tile, so the gap between two trees side by side slows too, but brushing
 * along the outside of a tree doesn't.
 */
export const TRUNK_RADIUS = 0.58;

/**
 * Whether (x, y) is among a tree's branches.
 */
export function inTrunk(map: WorldMap, x: number, y: number): boolean {
  const tx = Math.floor(x);
  const ty = Math.floor(y);
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (map.get(tx + dx, ty + dy) === 'tree' && Math.hypot(x - (tx + dx + 0.5), y - (ty + dy + 0.5)) < TRUNK_RADIUS) {
        return true;
      }
    }
  }
  return false;
}

export const MAP_WIDTH = 56;
export const MAP_HEIGHT = 34;

/**
 * Terrain levels: sunken hollows at -1, the ground at 0, terraces above.
 * Each level is LEVEL_HEIGHT world units (and tiles) up. Walkers can step
 * up at most STEP_UP at once (so only stairs and steps climb a level) but
 * can always drop down.
 */
export const MIN_LEVEL = -1;
export const MAX_LEVEL = 3;
export const LEVEL_HEIGHT = 1.5;
export const STEP_UP = 0.4;

/**
 * Tiles that ramp from their own level up to the higher neighbor they lead
 * to: stone stairs and built wooden steps.
 */
const RAMPS: ReadonlySet<Tile> = new Set<Tile>(['stairs', 'steps']);

const DIRS: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];

/**
 * The four ways stairs can be turned to climb (east, west, south, north), in
 * the order the map editor cycles through them.
 */
export const RAMP_DIRS: readonly [number, number][] = DIRS;

/**
 * Server simulation rate.
 */
export const TICK_RATE = 30;

/**
 * A changed tile, as sent to displays.
 */
export interface TileChange {
  /**
   * Row-major tile index (ty * MAP_WIDTH + tx).
   */
  i: number;

  /**
   * The new tile.
   */
  tile: Tile;
}

/**
 * The mutable tile grid plus the terrain level under each tile. The server
 * owns the real one and drains its tile changes each tick; displays keep a
 * mirror and use the same changes as a rebuild signal. Levels come from the
 * generator (or a preset) and only change in the map editor, which resends
 * the whole map. Stairs can be turned to climb a set way (`ramps`: 0 picks
 * the way by itself, else 1 + an index into RAMP_DIRS).
 */
export class WorldMap {
  private tiles: Tile[];
  private levels: Int8Array;
  private ramps: Int8Array;
  private changed = new Set<number>();

  private constructor(tiles: Tile[], levels: Int8Array, ramps = new Int8Array(MAP_WIDTH * MAP_HEIGHT)) {
    this.tiles = tiles;
    this.levels = levels;
    this.ramps = ramps;
  }

  /**
   * A flat map filled with one tile.
   */
  static filled(tile: Tile): WorldMap {
    return new WorldMap(Array.from({ length: MAP_WIDTH * MAP_HEIGHT }, (): Tile => tile), new Int8Array(MAP_WIDTH * MAP_HEIGHT));
  }

  /**
   * Parses an encoded map and its levels, or null if they don't fit the
   * current size.
   */
  static decode(encoded: string, levels: string, ramps?: string): WorldMap | null {
    if (encoded.length !== MAP_WIDTH * MAP_HEIGHT || levels.length !== MAP_WIDTH * MAP_HEIGHT) {
      return null;
    }
    const tiles = [...encoded].map((ch: string): Tile | undefined => TILE_BY_CHAR[ch]);
    const heights = Int8Array.from([...levels], (ch: string): number => Number(ch) + MIN_LEVEL);
    const turns = ramps?.length === MAP_WIDTH * MAP_HEIGHT
      ? Int8Array.from([...ramps], (ch: string): number => Math.min(RAMP_DIRS.length, Math.max(0, Number(ch) || 0)))
      : undefined;
    return tiles.every(Boolean) ? new WorldMap(tiles as Tile[], heights, turns) : null;
  }

  /**
   * One digit per tile: which way stairs there were turned (0 for their own
   * choice).
   */
  encodeRamps(): string {
    return this.ramps.join('');
  }

  /**
   * Turns the stairs on a tile to climb `dir` (an index into RAMP_DIRS), or
   * back to choosing for themselves (null).
   */
  setRamp(tx: number, ty: number, dir: number | null): void {
    if (tx >= 0 && ty >= 0 && tx < MAP_WIDTH && ty < MAP_HEIGHT) {
      this.ramps[ty * MAP_WIDTH + tx] = dir === null ? 0 : dir + 1;
    }
  }

  encode(): string {
    return this.tiles.map((t: Tile): string => CHAR_BY_TILE[t]).join('');
  }

  /**
   * One digit per tile: its level minus MIN_LEVEL.
   */
  encodeLevels(): string {
    return Array.from(this.levels, (l: number): string => String(l - MIN_LEVEL)).join('');
  }

  /**
   * The terrain level of a tile. Off-map reads as the ground.
   */
  level(tx: number, ty: number): number {
    if (tx < 0 || ty < 0 || tx >= MAP_WIDTH || ty >= MAP_HEIGHT) {
      return 0;
    }
    return this.levels[ty * MAP_WIDTH + tx];
  }

  /**
   * Sets a tile's terrain level (generation and the map editor; not sent
   * as a change).
   */
  setLevel(tx: number, ty: number, level: number): void {
    if (tx >= 0 && ty >= 0 && tx < MAP_WIDTH && ty < MAP_HEIGHT) {
      this.levels[ty * MAP_WIDTH + tx] = Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, level));
    }
  }

  /**
   * Height of a tile's floor (the low end of a ramp; a built platform's
   * deck is a level up).
   */
  base(tx: number, ty: number): number {
    return (this.level(tx, ty) + (this.get(tx, ty) === 'platform' ? 1 : 0)) * LEVEL_HEIGHT;
  }

  /**
   * Which way a ramp climbs: toward its highest open neighbor above it,
   * preferring one with open floor behind (so side by side stairs climb
   * together instead of into each other), or null when it isn't a ramp or
   * leads nowhere higher.
   */
  rampUp(tx: number, ty: number): [number, number] | null {
    if (!RAMPS.has(this.get(tx, ty))) {
      return null;
    }
    const own = this.base(tx, ty);
    const turned = this.ramps[ty * MAP_WIDTH + tx];
    if (turned > 0) {
      const [dx, dy] = RAMP_DIRS[turned - 1];
      if (!this.isSolid(tx + dx, ty + dy) && this.base(tx + dx, ty + dy) > own) {
        return [dx, dy];
      }
    }
    let best: [number, number] | null = null;
    let bestBase = own + 0.01;
    let bestFoot = false;
    for (const [dx, dy] of DIRS) {
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
   */
  isFoot(tx: number, ty: number, height: number): boolean {
    return !this.isSolid(tx, ty) && !RAMPS.has(this.get(tx, ty)) && this.base(tx, ty) === height;
  }

  /**
   * Height of a tile's highest point (the top of a ramp).
   */
  top(tx: number, ty: number): number {
    const up = this.rampUp(tx, ty);
    return up ? this.base(tx + up[0], ty + up[1]) : this.base(tx, ty);
  }

  /**
   * Ground height under a tile-space point, rising smoothly along ramps.
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
   */
  canStep(ax: number, ay: number, bx: number, by: number): boolean {
    const up = this.rampUp(ax, ay);
    const from = !up || (up[0] === bx - ax && up[1] === by - ay) ? this.top(ax, ay) : (this.base(ax, ay) + this.top(ax, ay)) / 2;
    return (!this.isSolid(bx, by) || PASSABLE.has(this.get(bx, by))) && this.base(bx, by) <= from + STEP_UP;
  }

  /**
   * Marks (with 1) every tile a walker can get to from one of `starts` and
   * also get back from.
   */
  roundTrip(starts: { x: number; y: number }[]): Uint8Array {
    const search = (forward: boolean): Uint8Array => {
      const seen = new Uint8Array(MAP_WIDTH * MAP_HEIGHT);
      const queue: number[] = [];
      for (const s of starts) {
        const i = Math.floor(s.y) * MAP_WIDTH + Math.floor(s.x);
        if (!seen[i]) {
          seen[i] = 1;
          queue.push(i);
        }
      }
      for (let head = 0; head < queue.length; head++) {
        const tx = queue[head] % MAP_WIDTH;
        const ty = Math.floor(queue[head] / MAP_WIDTH);
        for (const [dx, dy] of DIRS) {
          const nx = tx + dx;
          const ny = ty + dy;
          const n = ny * MAP_WIDTH + nx;
          if (nx < 0 || ny < 0 || nx >= MAP_WIDTH || ny >= MAP_HEIGHT || seen[n]) {
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

  /**
   * The tile at integer coordinates. Off-map reads as fence.
   */
  get(tx: number, ty: number): Tile {
    if (tx < 0 || ty < 0 || tx >= MAP_WIDTH || ty >= MAP_HEIGHT) {
      return 'fence';
    }
    return this.tiles[ty * MAP_WIDTH + tx];
  }

  set(tx: number, ty: number, tile: Tile): void {
    if (tx < 0 || ty < 0 || tx >= MAP_WIDTH || ty >= MAP_HEIGHT) {
      return;
    }
    const i = ty * MAP_WIDTH + tx;
    if (this.tiles[i] !== tile) {
      this.tiles[i] = tile;
      this.changed.add(i);
      if (!RAMPS.has(tile)) {
        this.ramps[i] = 0;
      }
    }
  }

  apply(changes: TileChange[]): void {
    for (const { i, tile } of changes) {
      this.set(i % MAP_WIDTH, Math.floor(i / MAP_WIDTH), tile);
    }
  }

  /**
   * Returns and clears the tiles changed since the last call.
   */
  takeChanges(): TileChange[] {
    const changes = [...this.changed].map((i: number): TileChange => ({ i, tile: this.tiles[i] }));
    this.changed.clear();
    return changes;
  }

  isSolid(tx: number, ty: number): boolean {
    return isSolidTile(this.get(tx, ty));
  }

  /**
   * Tile-center positions of every spawn tile.
   */
  spawnPoints(): { x: number; y: number }[] {
    return this.tiles.flatMap((t: Tile, i: number) =>
      t === 'spawn' ? [{ x: (i % MAP_WIDTH) + 0.5, y: Math.floor(i / MAP_WIDTH) + 0.5 }] : [],
    );
  }
}

/**
 * The tile a player at (x, y) facing `facing` acts on: just past their
 * hitbox edge, so it's the neighbor they're pressed against.
 */
export function facingTile(x: number, y: number, facing: number): { tx: number; ty: number } {
  return { tx: Math.floor(x + Math.cos(facing) * 0.8), ty: Math.floor(y + Math.sin(facing) * 0.8) };
}

/**
 * Where a player at (x, y) facing `facing` builds: the facing tile, or if
 * their hitbox (`radius`) still overlaps it, the next tile on past them,
 * so nothing is ever built on top of whoever builds it.
 */
export function placeTile(x: number, y: number, facing: number, radius: number): { tx: number; ty: number } {
  for (const reach of [0.8, 1.3, 1.8]) {
    const tx = Math.floor(x + Math.cos(facing) * reach);
    const ty = Math.floor(y + Math.sin(facing) * reach);
    if (!(x + radius > tx && x - radius < tx + 1 && y + radius > ty && y - radius < ty + 1)) {
      return { tx, ty };
    }
  }
  return facingTile(x, y, facing);
}

/**
 * Small deterministic PRNG (mulberry32).
 */
export function seededRandom(seed: number): () => number {
  let a = seed;
  return (): number => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
