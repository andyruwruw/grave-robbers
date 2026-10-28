// Packages
import {
  MAP_HEIGHT,
  MAP_WIDTH,
  WorldMap,
  seededRandom,
} from '@halloween/shared/world';

import { DEFAULT_MAP_GEN } from '@halloween/shared/map-gen';

// Types
import type { MapGenSettings } from '@halloween/shared/map-gen';
import type { Tile } from '@halloween/shared/world';

/**
 * An axis-aligned tile rectangle.
 */
interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

type Point = [number, number];

const CRYPT: Rect = { x: 24, y: 14, w: 8, h: 6 };
const CENTER_X = CRYPT.x + CRYPT.w / 2;
const CENTER_Y = CRYPT.y + CRYPT.h / 2;

/**
 * Within this distance of the center, main paths are cobbled.
 */
const COBBLE_RADIUS = 9;

/**
 * Tiles a landmark, plot, or tree may overwrite: open ground only.
 */
const OPEN: ReadonlySet<Tile> = new Set<Tile>(['grass']);

const DIRS: Point[] = [[1, 0], [-1, 0], [0, 1], [0, -1]];

/**
 * Pumpkins on a fresh map; the world grows new ones back to this many.
 */
export const PUMPKIN_COUNT = 10;

/**
 * Clumps of trees dotted over the open ground away from the forest edge
 * (centered at least GROVE_INSET tiles in from the fence).
 */
const GROVES = 16;
const GROVE_INSET = 6;

/**
 * Raised terraces (some with a higher core) and sunken hollows over the
 * open ground: their radius range in tiles (how many, how big, and how
 * often a terrace gets a core come from the map settings).
 */
const TERRACE_RADIUS = [5, 8];
const TERRACE_CORE_SCALE = 0.55;
const HOLLOW_RADIUS = [3.5, 5];

/**
 * With the extra stairs knob at full, the chance each spot where stairs
 * would fit gets them.
 */
const EXTRA_STAIRS_CHANCE = 0.12;

/**
 * Every raised or sunken tile sits inside a block this wide of tiles at
 * least as high (or low), so level changes are broad shelves, never thin
 * fingers or single-tile bumps.
 */
const SHELF = 3;

/**
 * The watchtower on the hill: footprint (walls included) and how many
 * floors its spiral stair climbs above the hill top.
 */
const TOWER_SIZE = 5;

/**
 * Widths (and heights) the round courtyards come in: the chapel and the
 * well plaza each try them in a random order and take the first that fits.
 */
const COURTYARD_SIZES = [7, 9, 11];
const RAMP_GROUND: ReadonlySet<Tile> = new Set<Tile>(['grass', 'path', 'cobble']);

/**
 * What may be cleared off the foot of stairs to make room.
 */
const SCENERY: ReadonlySet<Tile> = new Set<Tile>(['tree', 'rock', 'tombstone', 'cross', 'pumpkin', 'hedge', 'lamp']);

/**
 * Builds a fresh graveyard on a seed:
 *
 * 1. Fence border and the central crypt in a cobbled courtyard.
 * 2. Four winding main paths out from the crypt, with two spawns on each.
 * 3. One landmark per quadrant (ruined chapel, hill with stairs, row of
 *    mausoleums, well plaza), each linked to the nearest path.
 * 4. Terraces and hollows over the open ground, with stone stairs where
 *    paths cross a level change.
 * 5. Hedged grave plots with gaps, an uneven forest edge with clearings,
 *    lamp posts along the paths, and scattered rocks, trees, and pumpkins.
 *
 * More stairs are added until every open area can be reached and left
 * (plus extra ones if asked); pockets that still can't are filled with
 * trees. `gen` sets how many mountains and pits, which landmarks, and how
 * much scenery.
 */
export function generateWorld(seed: number, gen: MapGenSettings = DEFAULT_MAP_GEN): WorldMap {
  const rand = seededRandom(seed);
  const map = WorldMap.filled('grass');
  const g = new Gen(map, rand, gen);

  g.border();
  g.crypt();
  const arms = g.mainPaths();
  const spawns = g.spawns(arms);
  g.landmarks();
  g.terraces(spawns);
  g.connect(spawns);
  g.forestEdge();
  if (gen.structures.plots) {
    g.plots();
  }
  if (gen.structures.lamps) {
    g.lamps(arms);
  }
  g.scatter(spawns);
  g.tidyStairs();
  g.connect(spawns);
  g.extraStairs();
  g.fillUnreachable(spawns);
  map.takeChanges();
  return map;
}

/**
 * Generation steps sharing the map, the PRNG, and small helpers.
 */
class Gen {
  private reserved: Rect[] = [];

  constructor(private map: WorldMap, private rand: () => number, private gen: MapGenSettings) {}

  border(): void {
    for (let ty = 0; ty < MAP_HEIGHT; ty++) {
      for (let tx = 0; tx < MAP_WIDTH; tx++) {
        if (this.edge(tx, ty) === 0) {
          this.map.set(tx, ty, 'fence');
        }
      }
    }
  }

  /**
   * The crypt, with a 2-wide doorway on every side, in a one-tile cobbled
   * courtyard. Each doorway lines up with a main path.
   */
  crypt(): void {
    this.fill({ x: CRYPT.x - 1, y: CRYPT.y - 1, w: CRYPT.w + 2, h: CRYPT.h + 2 }, 'cobble');
    this.reserved.push({ x: CRYPT.x - 2, y: CRYPT.y - 2, w: CRYPT.w + 4, h: CRYPT.h + 4 });
    for (let ty = CRYPT.y; ty < CRYPT.y + CRYPT.h; ty++) {
      for (let tx = CRYPT.x; tx < CRYPT.x + CRYPT.w; tx++) {
        const wall = tx === CRYPT.x || tx === CRYPT.x + CRYPT.w - 1 || ty === CRYPT.y || ty === CRYPT.y + CRYPT.h - 1;
        const horizontalWall = ty === CRYPT.y || ty === CRYPT.y + CRYPT.h - 1;
        const door = horizontalWall ? tx === CENTER_X - 1 || tx === CENTER_X : ty === CENTER_Y - 1 || ty === CENTER_Y;
        this.map.set(tx, ty, wall && !door ? 'crypt' : 'flagstone');
      }
    }
  }

  /**
   * Four 2-wide paths that wander from the courtyard toward each side of
   * the map. Returns each arm's tiles in order, crypt end first.
   */
  mainPaths(): Point[][] {
    const jitter = (n: number): number => Math.floor((this.rand() - 0.5) * n);
    const arms: [Point, Point][] = [
      [[CENTER_X - 1, CRYPT.y - 2], [CENTER_X - 1 + jitter(10), 2]],
      [[CENTER_X - 1, CRYPT.y + CRYPT.h + 1], [CENTER_X - 1 + jitter(10), MAP_HEIGHT - 3]],
      [[CRYPT.x - 2, CENTER_Y - 1], [2, CENTER_Y - 1 + jitter(8)]],
      [[CRYPT.x + CRYPT.w + 1, CENTER_Y - 1], [MAP_WIDTH - 3, CENTER_Y - 1 + jitter(8)]],
    ];
    return arms.map(([from, to]) => {
      const tiles = this.wander(from, to);
      for (const [x, y] of tiles) {
        const tile: Tile = Math.hypot(x - CENTER_X, y - CENTER_Y) < COBBLE_RADIUS ? 'cobble' : 'path';
        for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
          if (this.map.get(x + dx, y + dy) === 'grass') {
            this.map.set(x + dx, y + dy, tile);
          }
        }
      }
      return tiles;
    });
  }

  /**
   * Two adjacent spawn tiles a little over halfway along each arm.
   */
  spawns(arms: Point[][]): Point[] {
    const spawns: Point[] = [];
    for (const arm of arms) {
      const [x, y] = arm[Math.floor(arm.length * 0.6)];
      for (const [sx, sy] of [[x, y], [x + 1, y + 1]] as Point[]) {
        this.map.set(sx, sy, 'spawn');
        spawns.push([sx, sy]);
      }
    }
    return spawns;
  }

  /**
   * One landmark per quadrant, in shuffled order, each tried at a few
   * spots until it fits on open ground. The hill (with the watchtower) is
   * tried again in the other quadrants if its own was too cramped.
   */
  landmarks(): void {
    const quadrants: Rect[] = [
      { x: 2, y: 2, w: CENTER_X - 4, h: CENTER_Y - 4 },
      { x: CENTER_X + 2, y: 2, w: MAP_WIDTH - CENTER_X - 4, h: CENTER_Y - 4 },
      { x: 2, y: CENTER_Y + 2, w: CENTER_X - 4, h: MAP_HEIGHT - CENTER_Y - 4 },
      { x: CENTER_X + 2, y: CENTER_Y + 2, w: MAP_WIDTH - CENTER_X - 4, h: MAP_HEIGHT - CENTER_Y - 4 },
    ];
    const hill = (q: Rect): boolean => this.place(q, 9, 7, (r: Rect) => this.hill(r));
    const hillBuilder = (q: Rect): boolean => hill(q);
    const { structures } = this.gen;
    const round = (build: (r: Rect) => Point) => (q: Rect): boolean =>
      this.shuffle([...COURTYARD_SIZES]).some((n: number): boolean => this.place(q, n, n, build));
    const builders = this.shuffle([
      structures.chapel && round((r: Rect) => this.chapel(r)),
      structures.tower && hillBuilder,
      structures.mausoleums && ((q: Rect): boolean => this.mausoleums(q)),
      structures.well && round((r: Rect) => this.wellPlaza(r)),
    ].filter((b): b is (q: Rect) => boolean => b !== false));
    const spots = this.shuffle(quadrants);
    const placed = spots.map((q: Rect, i: number): boolean => builders[i]?.(q) ?? false);
    if (structures.tower && !placed[builders.indexOf(hillBuilder)]) {
      spots.some((q: Rect, i: number): boolean => !placed[i] && hill(q)) || spots.some((q: Rect): boolean => hill(q));
    }
  }

  /**
   * Raised terraces (some with a higher core) and sunken hollows: noisy
   * blobs over open ground, kept off the fence, the crypt, the landmarks,
   * and the spawns. Anything narrower than SHELF is flattened back toward
   * the ground, then every path tile at the foot of a level change becomes
   * stairs.
   */
  terraces(spawns: Point[]): void {
    const free = (tx: number, ty: number): boolean =>
      this.edge(tx, ty) >= 3
      && !this.reserved.some((r: Rect): boolean => tx >= r.x && tx < r.x + r.w && ty >= r.y && ty < r.y + r.h)
      && !spawns.some(([sx, sy]): boolean => Math.abs(sx - tx) <= 2 && Math.abs(sy - ty) <= 2);
    const blob = (cx: number, cy: number, radius: number, from: number, to: number): void => {
      const phase = this.rand() * Math.PI * 2;
      for (let ty = Math.floor(cy - radius - 1); ty <= cy + radius + 1; ty++) {
        for (let tx = Math.floor(cx - radius - 1); tx <= cx + radius + 1; tx++) {
          const angle = Math.atan2(ty + 0.5 - cy, tx + 0.5 - cx);
          const reach = radius * (0.8 + 0.25 * Math.sin(angle * 3 + phase));
          if (Math.hypot(tx + 0.5 - cx, ty + 0.5 - cy) < reach && free(tx, ty) && this.map.level(tx, ty) === from) {
            this.map.setLevel(tx, ty, to);
          }
        }
      }
    };
    const center = (): Point => {
      for (let tries = 0; ; tries++) {
        const c: Point = [6 + this.rand() * (MAP_WIDTH - 12), 5 + this.rand() * (MAP_HEIGHT - 10)];
        if (tries > 50 || (free(Math.floor(c[0]), Math.floor(c[1])) && this.map.level(Math.floor(c[0]), Math.floor(c[1])) === 0)) {
          return c;
        }
      }
    };
    for (let i = 0; i < Math.round(this.gen.mountains); i++) {
      const [cx, cy] = center();
      const radius = (TERRACE_RADIUS[0] + this.rand() * (TERRACE_RADIUS[1] - TERRACE_RADIUS[0])) * this.gen.mountainSize;
      blob(cx, cy, radius, 0, 1);
      if (this.rand() < this.gen.peaks) {
        blob(cx, cy, radius * TERRACE_CORE_SCALE, 1, 2);
      }
    }
    for (let i = 0; i < Math.round(this.gen.pits); i++) {
      const [cx, cy] = center();
      blob(cx, cy, (HOLLOW_RADIUS[0] + this.rand() * (HOLLOW_RADIUS[1] - HOLLOW_RADIUS[0])) * this.gen.pitSize, 0, -1);
    }
    this.shelve(free);
    for (let ty = 1; ty < MAP_HEIGHT - 1; ty++) {
      for (let tx = 1; tx < MAP_WIDTH - 1; tx++) {
        const tile = this.map.get(tx, ty);
        if (tile !== 'path' && tile !== 'cobble') {
          continue;
        }
        const up = DIRS.some(([dx, dy]): boolean => {
          const n = this.map.get(tx + dx, ty + dy);
          return (n === 'path' || n === 'cobble') && this.map.level(tx + dx, ty + dy) === this.map.level(tx, ty) + 1;
        });
        if (up) {
          this.map.set(tx, ty, 'stairs');
        }
      }
    }
  }

  /**
   * Flattens anything raised or sunken that isn't part of a SHELF-wide
   * block at its level: each free tile drops (or rises) to the most any
   * block covering it supports, repeated until nothing changes.
   */
  private shelve(free: (tx: number, ty: number) => boolean): void {
    for (let changed = true; changed;) {
      changed = false;
      const up = new Int8Array(MAP_WIDTH * MAP_HEIGHT);
      const down = new Int8Array(MAP_WIDTH * MAP_HEIGHT);
      for (let wy = 0; wy + SHELF <= MAP_HEIGHT; wy++) {
        for (let wx = 0; wx + SHELF <= MAP_WIDTH; wx++) {
          let lo = Infinity;
          let hi = -Infinity;
          for (let y = wy; y < wy + SHELF; y++) {
            for (let x = wx; x < wx + SHELF; x++) {
              lo = Math.min(lo, this.map.level(x, y));
              hi = Math.max(hi, this.map.level(x, y));
            }
          }
          for (let y = wy; y < wy + SHELF; y++) {
            for (let x = wx; x < wx + SHELF; x++) {
              const i = y * MAP_WIDTH + x;
              up[i] = Math.max(up[i], lo);
              down[i] = Math.min(down[i], hi);
            }
          }
        }
      }
      for (let ty = 1; ty < MAP_HEIGHT - 1; ty++) {
        for (let tx = 1; tx < MAP_WIDTH - 1; tx++) {
          const i = ty * MAP_WIDTH + tx;
          const level = this.map.level(tx, ty);
          const fixed = level > 0 ? Math.min(level, up[i]) : Math.max(level, down[i]);
          if (fixed !== level && free(tx, ty)) {
            this.map.setLevel(tx, ty, fixed);
            changed = true;
          }
        }
      }
    }
  }

  /**
   * Adds stairs until every open tile can be reached from the spawns and
   * left again: at the foot of a level change between a reachable tile and
   * an unreachable one (or one that can't get back and one that can). The
   * tiles at either end of new stairs become dirt, so nothing grows there.
   */
  connect(spawns: Point[]): void {
    const starts = spawns.map(([x, y]): { x: number; y: number } => ({ x, y }));
    for (let round = 0; round < 60; round++) {
      const ok = this.map.roundTrip(starts);
      const fixes: [Point, Point][] = [];
      for (let ty = 1; ty < MAP_HEIGHT - 1; ty++) {
        for (let tx = 1; tx < MAP_WIDTH - 1; tx++) {
          if (!RAMP_GROUND.has(this.map.get(tx, ty))) {
            continue;
          }
          for (const [dx, dy] of DIRS) {
            const ux = tx + dx;
            const uy = ty + dy;
            const back: Point = [tx - dx, ty - dy];
            if (
              this.map.level(ux, uy) === this.map.level(tx, ty) + 1
              && !this.map.isSolid(ux, uy)
              && ok[ty * MAP_WIDTH + tx] !== ok[uy * MAP_WIDTH + ux]
              && this.map.isFoot(...back, this.map.base(tx, ty))
              && this.fitsStairs(tx, ty, [dx, dy])
            ) {
              fixes.push([[tx, ty], [ux, uy]]);
            }
          }
        }
      }
      if (fixes.length === 0) {
        return;
      }
      const [[tx, ty], [ux, uy]] = fixes[Math.floor(this.rand() * fixes.length)];
      this.map.set(tx, ty, 'stairs');
      for (const [px, py] of [[ux, uy], [tx * 2 - ux, ty * 2 - uy]]) {
        if (this.map.get(px, py) === 'grass') {
          this.map.set(px, py, 'path');
        }
      }
    }
  }

  /**
   * More stairs than reaching everything needs, so level changes can be
   * crossed in more places: each spot where stairs would fit gets them with
   * a chance set by the `stairs` knob, never right beside other stairs.
   */
  extraStairs(): void {
    if (this.gen.stairs <= 0) {
      return;
    }
    for (let ty = 1; ty < MAP_HEIGHT - 1; ty++) {
      for (let tx = 1; tx < MAP_WIDTH - 1; tx++) {
        if (!RAMP_GROUND.has(this.map.get(tx, ty)) || this.rand() >= this.gen.stairs * EXTRA_STAIRS_CHANCE) {
          continue;
        }
        const crowded = [...DIRS, [1, 1], [-1, 1], [1, -1], [-1, -1]].some(([dx, dy]): boolean => this.map.get(tx + dx, ty + dy) === 'stairs');
        const dir = DIRS.find(([dx, dy]): boolean =>
          this.map.level(tx + dx, ty + dy) === this.map.level(tx, ty) + 1
          && !this.map.isSolid(tx + dx, ty + dy)
          && this.map.isFoot(tx - dx, ty - dy, this.map.base(tx, ty))
          && this.fitsStairs(tx, ty, [dx, dy]));
        if (!crowded && dir) {
          this.map.set(tx, ty, 'stairs');
          for (const [px, py] of [[tx + dir[0], ty + dir[1]], [tx - dir[0], ty - dir[1]]]) {
            if (this.map.get(px, py) === 'grass') {
              this.map.set(px, py, 'path');
            }
          }
        }
      }
    }
  }

  /**
   * Whether stairs here would climb that way with open floor at their foot,
   * without spoiling the foot of any stairs beside them.
   */
  private fitsStairs(tx: number, ty: number, dir: Point): boolean {
    const was = this.map.get(tx, ty);
    this.map.set(tx, ty, 'stairs');
    const up = this.map.rampUp(tx, ty);
    const fits = up !== null && up[0] === dir[0] && up[1] === dir[1]
      && DIRS.every(([dx, dy]): boolean => this.map.get(tx + dx, ty + dy) !== 'stairs' || this.stairsOk(tx + dx, ty + dy));
    this.map.set(tx, ty, was);
    return fits;
  }

  /**
   * Whether stairs climb exactly one level with open, flat floor at their
   * foot (not a wall, a drop, or more stairs).
   */
  private stairsOk(tx: number, ty: number): boolean {
    const up = this.map.rampUp(tx, ty);
    return up !== null
      && this.map.level(tx + up[0], ty + up[1]) === this.map.level(tx, ty) + 1
      && this.map.isFoot(tx - up[0], ty - up[1], this.map.base(tx, ty));
  }

  /**
   * Mends stairs that lost their head or foot to scenery (clearing it), and
   * turns stairs that still have no open floor below them back into path,
   * until all of them do.
   */
  tidyStairs(): void {
    for (let changed = true; changed;) {
      changed = false;
      for (let ty = 1; ty < MAP_HEIGHT - 1; ty++) {
        for (let tx = 1; tx < MAP_WIDTH - 1; tx++) {
          if (this.map.get(tx, ty) !== 'stairs' || this.stairsOk(tx, ty)) {
            continue;
          }
          if (!this.mendStairs(tx, ty)) {
            this.map.set(tx, ty, 'path');
          }
          changed = true;
        }
      }
    }
  }

  /**
   * Clears scenery from the tile above and the tile below stairs, in the
   * first direction where that leaves them climbing one level from open
   * floor.
   */
  private mendStairs(tx: number, ty: number): boolean {
    const level = this.map.level(tx, ty);
    const clearable = ([px, py]: Point): boolean => !this.map.isSolid(px, py) || SCENERY.has(this.map.get(px, py));
    for (const [dx, dy] of DIRS) {
      const head: Point = [tx + dx, ty + dy];
      const foot: Point = [tx - dx, ty - dy];
      if (
        this.map.level(...head) !== level + 1 || this.map.level(...foot) !== level
        || this.map.get(...foot) === 'stairs' || !clearable(head) || !clearable(foot)
      ) {
        continue;
      }
      for (const p of [head, foot]) {
        if (SCENERY.has(this.map.get(...p))) {
          this.map.set(...p, 'path');
        }
      }
      if (this.stairsOk(tx, ty)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Uneven forest along the fence, deepest in noisy bands, with a few
   * clearings left open.
   */
  forestEdge(): void {
    const clearings = Array.from({ length: 5 }, (): Point => {
      const side = Math.floor(this.rand() * 4);
      const along = this.rand();
      return [
        side < 2 ? Math.floor(along * MAP_WIDTH) : side === 2 ? 3 : MAP_WIDTH - 4,
        side >= 2 ? Math.floor(along * MAP_HEIGHT) : side === 0 ? 3 : MAP_HEIGHT - 4,
      ];
    });
    const phase = this.rand() * 10;
    for (let ty = 1; ty < MAP_HEIGHT - 1; ty++) {
      for (let tx = 1; tx < MAP_WIDTH - 1; tx++) {
        if (!OPEN.has(this.map.get(tx, ty))) {
          continue;
        }
        const depth = (3.2 + 1.6 * Math.sin((tx + ty) * 0.35 + phase) * Math.sin(tx * 0.17 - ty * 0.23 + phase)) * this.gen.forest;
        const edge = this.edge(tx, ty);
        const inClearing = clearings.some(([cx, cy]): boolean => Math.hypot(tx - cx, ty - cy) < 2.5);
        if (edge <= depth && !inClearing && this.rand() < 0.75) {
          this.map.set(tx, ty, 'tree');
        }
      }
    }
  }

  /**
   * Hedged grave plots in the remaining open ground. Each hedge has a
   * couple of gaps, and graves sit in rows with walkable lanes.
   */
  plots(): void {
    for (let tries = 0; tries < 200; tries++) {
      const w = 5 + Math.floor(this.rand() * 5);
      const h = 4 + Math.floor(this.rand() * 4);
      const x = 2 + Math.floor(this.rand() * (MAP_WIDTH - w - 4));
      const y = 2 + Math.floor(this.rand() * (MAP_HEIGHT - h - 4));
      const r = { x, y, w, h };
      if (!this.isOpen({ x: x - 1, y: y - 1, w: w + 2, h: h + 2 })) {
        continue;
      }
      const hedge = this.rand() < 0.7;
      const gaps = this.perimeter(r).filter((_: Point, i: number, all: Point[]): boolean => i % Math.max(3, Math.floor(all.length / 3)) === 1);
      for (const [px, py] of this.perimeter(r)) {
        const isGap = gaps.some(([gx, gy]): boolean => Math.abs(gx - px) + Math.abs(gy - py) <= 1);
        if (hedge && !isGap && !this.isCorner(r, px, py)) {
          this.map.set(px, py, 'hedge');
        }
      }
      for (let ty = y + 1; ty < y + h - 1; ty++) {
        for (let tx = x + 1; tx < x + w - 1; tx++) {
          if ((ty - y) % 2 === 1 && (tx - x) % 2 === 1 && this.rand() < Math.min(1, 0.8 * this.gen.graves)) {
            this.map.set(tx, ty, this.rand() < 0.65 ? 'tombstone' : 'cross');
          }
        }
      }
    }
  }

  /**
   * Lamp posts beside the main paths every so often, alternating sides.
   */
  lamps(arms: Point[][]): void {
    for (const arm of arms) {
      for (let i = 4; i < arm.length - 2; i += 7) {
        const [x, y] = arm[i];
        const horizontal = Math.abs(arm[arm.length - 1][0] - arm[0][0]) > Math.abs(arm[arm.length - 1][1] - arm[0][1]);
        const side = (i / 7) % 2 < 1 ? -1 : 2;
        const [lx, ly] = horizontal ? [x, y + side] : [x + side, y];
        if (this.map.get(lx, ly) === 'grass' || this.map.get(lx, ly) === 'tree') {
          this.map.set(lx, ly, 'lamp');
        }
      }
    }
  }

  /**
   * Groves of trees, then rocks, lone trees, and pumpkins on open ground,
   * kept off the spawns.
   */
  scatter(spawns: Point[]): void {
    const nearSpawn = (tx: number, ty: number): boolean =>
      spawns.some(([sx, sy]): boolean => Math.abs(sx - tx) <= 1 && Math.abs(sy - ty) <= 1);
    for (let grove = 0, tries = 0; grove < Math.round(GROVES * this.gen.trees) && tries < 400; tries++) {
      const cx = GROVE_INSET + this.rand() * (MAP_WIDTH - GROVE_INSET * 2);
      const cy = GROVE_INSET + this.rand() * (MAP_HEIGHT - GROVE_INSET * 2);
      if (this.map.get(Math.floor(cx), Math.floor(cy)) !== 'grass') {
        continue;
      }
      grove++;
      const radius = 1.3 + this.rand() * 1.6;
      for (let ty = Math.floor(cy - radius); ty <= cy + radius; ty++) {
        for (let tx = Math.floor(cx - radius); tx <= cx + radius; tx++) {
          if (this.map.get(tx, ty) === 'grass' && !nearSpawn(tx, ty) && Math.hypot(tx + 0.5 - cx, ty + 0.5 - cy) < radius && this.rand() < 0.7) {
            this.map.set(tx, ty, 'tree');
          }
        }
      }
    }
    for (let ty = 1; ty < MAP_HEIGHT - 1; ty++) {
      for (let tx = 1; tx < MAP_WIDTH - 1; tx++) {
        if (this.map.get(tx, ty) !== 'grass' || nearSpawn(tx, ty)) {
          continue;
        }
        const roll = this.rand();
        const rock = 0.03 * this.gen.rocks;
        const tree = rock + (this.edge(tx, ty) >= GROVE_INSET ? 0.07 : 0.045) * this.gen.trees;
        const grave = tree + (this.edge(tx, ty) >= 3 ? 0.006 * this.gen.graves * (1 + this.gen.graves) : 0);
        if (roll < rock) {
          this.map.set(tx, ty, 'rock');
        } else if (roll < tree) {
          this.map.set(tx, ty, 'tree');
        } else if (roll < grave) {
          this.map.set(tx, ty, this.rand() < 0.65 ? 'tombstone' : 'cross');
        }
      }
    }
    let pumpkins = 0;
    for (let tries = 0; pumpkins < Math.round(PUMPKIN_COUNT * this.gen.pumpkins) && tries < 800; tries++) {
      const tx = 1 + Math.floor(this.rand() * (MAP_WIDTH - 2));
      const ty = 1 + Math.floor(this.rand() * (MAP_HEIGHT - 2));
      const besidePath = DIRS.some(([dx, dy]): boolean => ['path', 'cobble'].includes(this.map.get(tx + dx, ty + dy)));
      if (this.map.get(tx, ty) === 'grass' && besidePath && !nearSpawn(tx, ty)) {
        this.map.set(tx, ty, 'pumpkin');
        pumpkins++;
      }
    }
  }

  /**
   * Turns every open tile that can't be reached from the spawns and left
   * again into a tree.
   */
  fillUnreachable(spawns: Point[]): void {
    const ok = this.map.roundTrip(spawns.map(([x, y]): { x: number; y: number } => ({ x, y })));
    for (let ty = 0; ty < MAP_HEIGHT; ty++) {
      for (let tx = 0; tx < MAP_WIDTH; tx++) {
        if (!this.map.isSolid(tx, ty) && !ok[ty * MAP_WIDTH + tx]) {
          this.map.set(tx, ty, 'tree');
        }
      }
    }
  }

  /**
   * A ruined chapel: broken walls with a doorway toward the center, a few
   * extra collapsed gaps, a flagstone floor, and a statue at the altar.
   */
  private chapel(r: Rect): Point {
    const disk = this.disk(r, 'flagstone');
    const door = this.doorTowardCenter(r);
    const ring = disk.filter(([px, py]): boolean => DIRS.some(([dx, dy]): boolean => !disk.some(([qx, qy]): boolean => qx === px + dx && qy === py + dy)));
    const broken = new Set(Array.from({ length: 2 + Math.floor(r.w / 4) }, (): number => Math.floor(this.rand() * ring.length)));
    ring.forEach(([px, py]: Point, i: number): void => {
      const isDoor = Math.abs(px - door[0]) + Math.abs(py - door[1]) <= 1;
      if (!isDoor && !broken.has(i)) {
        this.map.set(px, py, 'ruin');
      }
    });
    const cx = r.x + Math.floor(r.w / 2);
    const cy = r.y + Math.floor(r.h / 2);
    const altar: Point = [cx + Math.sign(cx - door[0]) * Math.floor(r.w / 2 - 1.5), cy + Math.sign(cy - door[1]) * Math.floor(r.h / 2 - 1.5)];
    this.map.set(altar[0], altar[1], 'statue');
    return door;
  }

  /**
   * Fills the round part of a square footprint (corners left as they were)
   * and returns its tiles.
   */
  private disk(r: Rect, tile: Tile): Point[] {
    const cx = r.x + (r.w - 1) / 2;
    const cy = r.y + (r.h - 1) / 2;
    const radius = (r.w - 1) / 2 + 0.35;
    const tiles: Point[] = [];
    for (let ty = r.y; ty < r.y + r.h; ty++) {
      for (let tx = r.x; tx < r.x + r.w; tx++) {
        if (Math.hypot(tx - cx, ty - cy) <= radius) {
          this.map.set(tx, ty, tile);
          tiles.push([tx, ty]);
        }
      }
    }
    return tiles;
  }

  /**
   * A hill a level up with lamp posts on its corners, stairs up the side
   * facing the center and the opposite side, and a watchtower on top.
   */
  private hill(r: Rect): Point {
    for (let ty = r.y; ty < r.y + r.h; ty++) {
      for (let tx = r.x; tx < r.x + r.w; tx++) {
        this.map.setLevel(tx, ty, 1);
      }
    }
    for (const [px, py] of this.perimeter(r)) {
      if (this.isCorner(r, px, py)) {
        this.map.set(px, py, 'lamp');
      }
    }
    const door = this.doorTowardCenter(r);
    for (const [sx, sy] of [door, this.oppositeSide(r, door)]) {
      for (const [dx, dy] of sy === r.y || sy === r.y + r.h - 1 ? [[0, 0], [1, 0]] : [[0, 0], [0, 1]]) {
        this.map.set(sx + dx, sy + dy, 'stairs');
        this.map.setLevel(sx + dx, sy + dy, 0);
      }
    }
    this.tower({ x: r.x + Math.floor((r.w - TOWER_SIZE) / 2), y: r.y + Math.floor((r.h - TOWER_SIZE) / 2), w: TOWER_SIZE, h: TOWER_SIZE });
    return door;
  }

  /**
   * A stone watchtower: walls around a 3x3 room with a pillar in the
   * middle, a doorway toward the map center, and stairs spiraling up
   * around the pillar from the door: past a corner to a step up to the
   * next corner, another step up to the top floor, which runs the rest of
   * the way round. Steps sit mid-side so each has a corner landing below
   * it, never a wall.
   */
  private tower(r: Rect): void {
    this.fill(r, 'tower');
    const base = this.map.level(r.x, r.y);
    const ring: Point[] = [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2], [1, 2], [0, 2], [0, 1]];
    const [doorX, doorY] = this.doorTowardCenter(r);
    const inside: Point = [Math.min(r.x + 3, Math.max(r.x + 1, doorX)), Math.min(r.y + 3, Math.max(r.y + 1, doorY))];
    const start = ring.findIndex(([ix, iy]): boolean => r.x + 1 + ix === inside[0] && r.y + 1 + iy === inside[1]);
    const floors: [Tile, number][] = [
      ['flagstone', 0], ['flagstone', 0], ['stairs', 0], ['flagstone', 1],
      ['stairs', 1], ['flagstone', 2], ['flagstone', 2], ['flagstone', 2],
    ];
    floors.forEach(([tile, up]: [Tile, number], i: number): void => {
      const [ix, iy] = ring[(start + i) % ring.length];
      this.map.set(r.x + 1 + ix, r.y + 1 + iy, tile);
      this.map.setLevel(r.x + 1 + ix, r.y + 1 + iy, base + up);
    });
    this.map.set(doorX, doorY, 'flagstone');
  }

  /**
   * One to three mausoleums dotted around a quadrant, each on its own with
   * a cobbled step in front (and sometimes a statue on it), linked to the
   * paths. Returns whether any fit.
   */
  private mausoleums(q: Rect): boolean {
    const count = 1 + Math.floor(this.rand() * 3);
    let built = 0;
    for (let i = 0; i < count; i++) {
      built += this.place(q, 3, 3, (r: Rect) => this.mausoleum(r)) ? 1 : 0;
    }
    return built > 0;
  }

  private mausoleum(r: Rect): Point {
    this.fill({ x: r.x, y: r.y, w: 3, h: 2 }, 'mausoleum');
    for (let tx = r.x; tx < r.x + 3; tx++) {
      this.map.set(tx, r.y + 2, 'cobble');
    }
    if (this.rand() < 0.4) {
      this.map.set(r.x + (this.rand() < 0.5 ? 0 : 2), r.y + 2, 'statue');
    }
    return [r.x + 1, r.y + 2];
  }

  /**
   * A round cobbled plaza with a well in the middle, a statue, and lamps
   * on either side.
   */
  private wellPlaza(r: Rect): Point {
    this.disk(r, 'cobble');
    const c = Math.floor(r.w / 2);
    const off = Math.max(1, Math.floor(((r.w - 1) / 2) * 0.7));
    this.map.set(r.x + c, r.y + c, 'well');
    this.map.set(r.x + c - off, r.y + c - off, 'lamp');
    this.map.set(r.x + c + off, r.y + c + off, 'lamp');
    this.map.set(r.x + c + off, r.y + c - off, 'statue');
    return this.doorTowardCenter(r);
  }

  /**
   * Tries a w x h footprint at random spots in a quadrant; builds it at the
   * first all-open spot and links its entrance to the nearest path.
   */
  private place(q: Rect, w: number, h: number, build: (r: Rect) => Point): boolean {
    for (let tries = 0; tries < 40; tries++) {
      const r = {
        x: q.x + Math.floor(this.rand() * Math.max(1, q.w - w)),
        y: q.y + Math.floor(this.rand() * Math.max(1, q.h - h)),
        w,
        h,
      };
      if (this.isOpen({ x: r.x - 1, y: r.y - 1, w: r.w + 2, h: r.h + 2 })) {
        this.reserved.push({ x: r.x - 1, y: r.y - 1, w: r.w + 2, h: r.h + 2 });
        this.linkToPath(build(r), r);
        return true;
      }
    }
    return false;
  }

  /**
   * Carves a 1-wide dirt path from an entrance to the nearest path tile
   * outside the landmark itself, only through grass.
   */
  private linkToPath([fx, fy]: Point, own: Rect): void {
    const inside = (x: number, y: number): boolean => x >= own.x && x < own.x + own.w && y >= own.y && y < own.y + own.h;
    const prev = new Map<number, number>();
    const start = fy * MAP_WIDTH + fx;
    prev.set(start, -1);
    const queue = [start];
    let goal = -1;
    while (queue.length > 0 && goal < 0) {
      const i = queue.shift()!;
      for (const [dx, dy] of DIRS) {
        const nx = (i % MAP_WIDTH) + dx;
        const ny = Math.floor(i / MAP_WIDTH) + dy;
        const ni = ny * MAP_WIDTH + nx;
        const tile = this.map.get(nx, ny);
        if (prev.has(ni)) {
          continue;
        }
        if ((tile === 'path' || tile === 'cobble') && !inside(nx, ny)) {
          prev.set(ni, i);
          goal = i;
          break;
        }
        if (tile === 'grass' || inside(nx, ny) && !this.map.isSolid(nx, ny)) {
          prev.set(ni, i);
          queue.push(ni);
        }
      }
    }
    for (let i = goal; i >= 0 && i !== start; i = prev.get(i)!) {
      if (this.map.get(i % MAP_WIDTH, Math.floor(i / MAP_WIDTH)) === 'grass') {
        this.map.set(i % MAP_WIDTH, Math.floor(i / MAP_WIDTH), 'path');
      }
    }
  }

  /**
   * Biased random walk from `from` to `to`: mostly straight, with
   * occasional sideways jogs that last a few steps.
   */
  private wander([fx, fy]: Point, [tx, ty]: Point): Point[] {
    const tiles: Point[] = [[fx, fy]];
    let x = fx;
    let y = fy;
    let jog: Point = [0, 0];
    let jogLeft = 0;
    for (let guard = 0; (x !== tx || y !== ty) && guard < 800; guard++) {
      const dx = Math.sign(tx - x);
      const dy = Math.sign(ty - y);
      const remaining = Math.abs(tx - x) + Math.abs(ty - y);
      if (jogLeft === 0 && remaining > 5 && this.rand() < 0.12) {
        const sideways = Math.abs(tx - x) > Math.abs(ty - y) ? [0, 1] : [1, 0];
        const s = this.rand() < 0.5 ? -1 : 1;
        jog = [sideways[0] * s, sideways[1] * s];
        jogLeft = 2 + Math.floor(this.rand() * 2);
      }
      let step: Point = Math.abs(tx - x) >= Math.abs(ty - y) ? [dx, 0] : [0, dy];
      if (jogLeft > 0) {
        step = jog;
        jogLeft--;
      }
      const nx = Math.min(MAP_WIDTH - 3, Math.max(1, x + step[0]));
      const ny = Math.min(MAP_HEIGHT - 3, Math.max(1, y + step[1]));
      const blocked = this.map.get(nx, ny) === 'crypt' || this.map.get(nx, ny) === 'flagstone';
      if (blocked) {
        jogLeft = 0;
        continue;
      }
      x = nx;
      y = ny;
      tiles.push([x, y]);
    }
    return tiles;
  }

  /**
   * The middle of the rectangle's side that faces the map center.
   */
  private doorTowardCenter(r: Rect): Point {
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2;
    const dx = CENTER_X - cx;
    const dy = CENTER_Y - cy;
    if (Math.abs(dx) / r.w > Math.abs(dy) / r.h) {
      return [dx > 0 ? r.x + r.w - 1 : r.x, r.y + Math.floor(r.h / 2)];
    }
    return [r.x + Math.floor(r.w / 2), dy > 0 ? r.y + r.h - 1 : r.y];
  }

  private oppositeSide(r: Rect, [px, py]: Point): Point {
    if (px === r.x || px === r.x + r.w - 1) {
      return [px === r.x ? r.x + r.w - 1 : r.x, py];
    }
    return [px, py === r.y ? r.y + r.h - 1 : r.y];
  }

  private perimeter(r: Rect): Point[] {
    const points: Point[] = [];
    for (let tx = r.x; tx < r.x + r.w; tx++) {
      points.push([tx, r.y]);
    }
    for (let ty = r.y + 1; ty < r.y + r.h; ty++) {
      points.push([r.x + r.w - 1, ty]);
    }
    for (let tx = r.x + r.w - 2; tx >= r.x; tx--) {
      points.push([tx, r.y + r.h - 1]);
    }
    for (let ty = r.y + r.h - 2; ty > r.y; ty--) {
      points.push([r.x, ty]);
    }
    return points;
  }

  private isCorner(r: Rect, x: number, y: number): boolean {
    return (x === r.x || x === r.x + r.w - 1) && (y === r.y || y === r.y + r.h - 1);
  }

  private isOpen(r: Rect): boolean {
    for (let ty = r.y; ty < r.y + r.h; ty++) {
      for (let tx = r.x; tx < r.x + r.w; tx++) {
        if (!OPEN.has(this.map.get(tx, ty)) || this.edge(tx, ty) < 2) {
          return false;
        }
      }
    }
    return true;
  }

  private fill(r: Rect, tile: Tile): void {
    for (let ty = r.y; ty < r.y + r.h; ty++) {
      for (let tx = r.x; tx < r.x + r.w; tx++) {
        this.map.set(tx, ty, tile);
      }
    }
  }

  private edge(tx: number, ty: number): number {
    return Math.min(tx, ty, MAP_WIDTH - 1 - tx, MAP_HEIGHT - 1 - ty);
  }

  private shuffle<T>(list: T[]): T[] {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(this.rand() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }
}
