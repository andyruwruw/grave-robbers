// Packages
import {
  Euler,
  Group,
  Quaternion,
  Vector3,
} from 'three';
import {
  LEVEL_HEIGHT,
  MAP_HEIGHT,
  MAP_WIDTH,
  seededRandom,
} from '@halloween/shared/world';

// Local Imports
import { VoxelBatch } from './voxel-batch';

// Types
import type {
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
} from 'three';
import type { Tile, WorldMap } from '@halloween/shared/world';

const GRASS = ['#1b2a19', '#20301d', '#182515', '#253520', '#1d2c18'];
const DEAD_GRASS = ['#4a4a2a', '#3c4424', '#55502e'];
const MOSS = ['#2c4a22', '#335428'];
const LEAVES = ['#7a3b1c', '#8c4a1f', '#6b3a18', '#9a5a24'];
const MUSHROOM_CAP = ['#a8322a', '#c9b48a'];
const MUSHROOM_STEM = '#d8cfb8';
const DIRT = ['#3a2e24', '#42352a', '#33281f', '#3d3026'];
const PEBBLE = ['#4e4a46', '#5a5550'];
const COBBLE = ['#4d5056', '#474a50', '#53565c', '#44474d'];
const GROUT = '#3a3c42';
const FLAG = ['#4f4b45', '#57534c', '#4a4640'];
const STONE = ['#6b6f78', '#5f636c', '#777b84', '#585c64'];

/**
 * The open hole of a dug-up grave.
 */
const PIT = '#120d0a';
const BOULDER = ['#55585f', '#4b4e55', '#60636a'];
const CRYPT = ['#45484f', '#3d4047', '#4d5058'];
const CRYPT_TRIM = ['#565962', '#5d6069'];
const CRYPT_DARK = '#2a2c32';
const MARBLE = ['#7d7a74', '#88857e', '#716e68'];
const DOORWAY = '#121216';
const STATUE = ['#9a9a96', '#8e8e8a', '#a3a39e'];
const WATER = '#0e1b26';
const HEDGE = ['#1d3a20', '#22432a', '#18321b'];
const PINE = ['#16281c', '#1b3022', '#12221a'];
const IRON = '#23232a';
const BARK = '#2b1f17';
const STUMP_RING = '#6b4a2e';
const PUMPKIN = '#d9661e';
const PUMPKIN_STEM = '#3d5a1e';
const CANDLE = '#ffb347';
const LAMP_GLASS = '#ffd98a';
const PLANK = ['#6e4a2c', '#7a5332', '#634228'];
const PLANK_DARK = '#3e2a19';
const BRICK = ['#70747d', '#666a73', '#7b7f88', '#5d6169'];
const IRON_SPIKE = '#9aa0aa';
const EMBER_STONE = '#4a4d55';
const BURLAP = ['#8a7448', '#a08c5a'];
const CHEST_WOOD = ['#5e3d22', '#6b4527'];
const CHEST_BAND = '#2e2d33';
const GOLD = '#e8c547';
const STRAW = '#c9a94a';
const STAKE = ['#5a3e26', '#664629', '#4f3621'];
const STAKE_TIP = '#a07a4c';
const ROPE = '#6b5a3a';
const PAPER = ['#d8cfb8', '#cfc3a4', '#e2dac6'];
const BOOK = ['#5a1f1f', '#2f3b5a', '#3d4a26'];
const SAWDUST = '#b8955f';
const FURNACE_STONE = ['#5b5550', '#655e58', '#524c47'];
const SOOT = '#33302d';
const BONE = ['#e6dcc0', '#d8cca8', '#efe6cc', '#cfc19c'];
const SOCKET = '#1a1210';
const WAX = '#d8cfb8';
const ALTAR_STONE = ['#4a4448', '#544d52', '#403a3e'];
const BLOOD_STAIN = ['#5a0e12', '#6e1218', '#4a0a0e'];
const BONE_PACK = '#3a3128';

/**
 * Blood standing in a basin: dim, but drawn unlit so it reads in the dark.
 */
const BLOOD_POOL = '#8a0c18';
const ALTAR_TROUGH = '#160608';
const FORGE_STONE = ['#2e2a2c', '#363134', '#28242a'];
const FORGE_FLOOR = '#3a0c10';
const BLOODSTEEL = ['#6e1420', '#7e1626', '#5c101a'];
const FORGE_IRON = '#1c1c22';
const WIRE = '#5d6068';
const PALE_IRON = '#8a9a98';
const SOUL_STONE = ['#2a3038', '#323a44', '#262c34'];
const SOUL_GLOW = '#7fe0ff';
const OBELISK_STONE = ['#1c1a22', '#24212c', '#18161e'];
const RUNE = '#b04aff';
const MIRROR_GLASS = '#a9b6c2';
const MIRROR_FRAME = ['#2a1a20', '#331f27'];
const SILVER = ['#d4dce6', '#c4ccd8'];
const SILVER_FLECK = '#e8eef6';
const GRIT = ['#7d8088', '#6f727a', '#888b93'];
const MESH_WIRE = '#8a8f96';
const VIAL_GLASS = '#a8bcc4';
const SENTRY_EYE = '#ff2a2a';
const DIGGER_EYE = '#7fd36a';
const PICK_HEAD = '#7a7f88';
const COFFIN_WOOD = ['#2e1d14', '#3a261a'];
const BELL_GLEAM = '#eef4ff';
const BREW = ['#7ddc4a', '#9cf06a', '#5cbf34'];

/**
 * Tiles a palisade or fence lines up with.
 */
const WALLS: ReadonlySet<Tile> = new Set<Tile>(['wood-fence', 'wood-wall', 'stone-wall', 'palisade', 'door', 'bone-wall']);

const TOWER_STONE = ['#4f525a', '#575a62', '#4a4d55'];
const LIP = ['#4d443a', '#544a3f'];
const WALL_STONE = ['#3a2f25', '#42352a', '#332920', '#4a3c2e', '#3e3227'];
const MORTAR = '#18130f';
const FOOT = '#07090a';
const TREAD = ['#6e665c', '#766d62', '#675f55'];

/**
 * Grass by terrain level, lighter the higher it is, so shelves read at a
 * glance.
 */
const GRASS_BY_LEVEL: Record<number, string[]> = {
  [-1]: ['#111a12', '#131e14', '#0f1810', '#162117', '#121c12'],
  0: GRASS,
  1: ['#2e4226', '#34492b', '#2a3d22', '#3a4f2e', '#304526'],
  2: ['#445c35', '#4b643a', '#3f5631', '#526b3f', '#475f37'],
  3: ['#445c35', '#4b643a', '#3f5631', '#526b3f', '#475f37'],
};

/**
 * Courses in a retaining wall: about this tall each.
 */
const WALL_COURSE = 0.28;

/**
 * The watchtower: its walls rise this far above the hill (to a parapet
 * over the top floor), and the part painted with the rest of the world
 * stops at TOWER_COURSE; everything above is the cutaway model (see
 * `buildTower`).
 */
const TOWER_WALL = LEVEL_HEIGHT * 2 + 1.2;
const TOWER_COURSE = 0.35;

/**
 * How far below TOWER_WALL a ruined wall column may crumble (more on the
 * side facing the camera), and how tall the broken pillar stands above its
 * floor.
 */
const TOWER_CRUMBLE = 1.4;
const TOWER_PILLAR = LEVEL_HEIGHT * 2 + 0.8;

/**
 * Ground tiles; anything else stands on a floor guessed from its neighbors.
 */
const GROUND: ReadonlySet<Tile> = new Set<Tile>(['grass', 'path', 'spawn', 'cobble', 'flagstone', 'stairs', 'mound']);

/**
 * Whether a tile is bare ground (nothing standing on it).
 */
export function isGround(tile: Tile): boolean {
  return GROUND.has(tile);
}
const FLOORS: Tile[] = ['grass', 'path', 'cobble', 'flagstone'];

/**
 * A light that never goes out, baked into the map.
 */
export interface StaticLight {
  x: number;
  y: number;
  kind: 'pumpkin' | 'lamp' | 'candle';
}

/**
 * Converts tile-space coordinates (x east, y south) to world space, with the
 * map centered on the origin and the ground top at y = 0.
 */
export function toWorld(x: number, y: number): { x: number; z: number } {
  return { x: x - MAP_WIDTH / 2, z: y - MAP_HEIGHT / 2 };
}

/**
 * Picks one entry from a palette.
 */
function pick<T>(rand: () => number, list: T[]): T {
  return list[Math.floor(rand() * list.length)];
}

/**
 * Somewhere to put boxes.
 */
type Batch = Pick<VoxelBatch, 'add'>;

/**
 * Everything a tile painter needs: the batches, a per-tile PRNG, the tile's
 * world-space center, the height its contents stand on (its terrain level),
 * and the map for neighbor checks.
 */
interface Paint {
  lit: Batch;
  glow: Batch;
  rand: () => number;
  map: WorldMap;
  tx: number;
  ty: number;
  x: number;
  z: number;
  base: number;
}

/**
 * Builds every static voxel in the graveyard, including player structures
 * (flames are animated separately). Trees go in a mesh of their own, each
 * box tagged with its tree's base, so `TreeSway` can shake them. Decoration is seeded per tile, so
 * rebuilding after a tile change only alters that tile. Tiles in `bare`
 * (by index) get only their ground, for something drawn on its own while
 * it grows in.
 *
 * @returns The world group and every permanent light (pumpkins, lamps,
 * candles, and a faint glow on chests so they can be found).
 */
export function buildGraveyard(map: WorldMap, seed: number, bare: ReadonlySet<number> = new Set()): { group: Group; lights: StaticLight[] } {
  const lit = new VoxelBatch();
  const glow = new VoxelBatch();
  const trees = new VoxelBatch();
  const lights: StaticLight[] = [];

  for (let ty = 0; ty < MAP_HEIGHT; ty++) {
    for (let tx = 0; tx < MAP_WIDTH; tx++) {
      const tile = map.get(tx, ty);
      const floor = GROUND.has(tile) ? tile : floorUnder(map, tx, ty);
      const { x, z } = toWorld(tx + 0.5, ty + 0.5);
      const p = tilePaint(map, seed, tx, ty, lit, glow, x, z);
      paintGround(p, floor);
      if (bare.has(ty * MAP_WIDTH + tx)) {
        continue;
      }
      if (tile === 'tree') {
        trees.anchor = [x, p.base, z];
        PAINTERS.tree!({ ...p, lit: trees });
        continue;
      }
      PAINTERS[tile]?.(p);
      if (tile === 'pumpkin' || tile === 'lamp') {
        lights.push({ x: tx + 0.5, y: ty + 0.5, kind: tile });
      } else if (tile === 'tower' && [[1, 0], [-1, 0], [0, 1], [0, -1]].every(([dx, dy]): boolean => map.get(tx + dx, ty + dy) !== 'tower')) {
        lights.push({ x: tx + 0.5, y: ty + 0.5, kind: 'candle' });
      } else if (tile === 'chest') {
        lights.push({ x: tx + 0.5, y: ty + 0.6, kind: 'candle' });
      } else if (tile === 'statue' || isMausoleumDoor(map, tx, ty) || tile === 'crypt' && besideDoorway(map, tx, ty)) {
        lights.push({ x: tx + 0.5, y: ty + 1, kind: 'candle' });
      }
    }
  }

  for (let ty = 0; ty < MAP_HEIGHT; ty++) {
    for (let tx = 0; tx < MAP_WIDTH; tx++) {
      for (const [dx, dy] of [[1, 0], [0, 1]] as const) {
        if (shrubBetween(map, tx, ty, dx, dy) && !bare.has(ty * MAP_WIDTH + tx) && !bare.has((ty + dy) * MAP_WIDTH + tx + dx)) {
          const { x, z } = toWorld(tx + 0.5 + dx / 2, ty + 0.5 + dy / 2);
          paintShrub(lit, seed, tx, ty, dx === 1, x, z, map.level(tx, ty) * LEVEL_HEIGHT);
        }
      }
    }
  }

  const group = new Group();
  group.add(lit.build(), glow.build(true), trees.build());
  return { group, lights };
}

/**
 * Whether undergrowth fills the gap between a tree and its neighbor
 * (dx, dy): both are trees on the same level. It shows where walking
 * between them slows you down.
 */
export function shrubBetween(map: WorldMap, tx: number, ty: number, dx: number, dy: number): boolean {
  return map.get(tx, ty) === 'tree' && map.get(tx + dx, ty + dy) === 'tree' && map.level(tx, ty) === map.level(tx + dx, ty + dy);
}

/**
 * Low bushes filling the gap between two trees side by side, centered on
 * their shared edge at (x, z), running along x or z. Seeded by the edge, so
 * it's the same every rebuild.
 */
function paintShrub(lit: VoxelBatch, seed: number, tx: number, ty: number, alongX: boolean, x: number, z: number, base: number): void {
  const rand = seededRandom(seed ^ Math.imul(ty * MAP_WIDTH + tx + 1, 2246822519) ^ (alongX ? 0x51ed27 : 0x2a17c3));
  for (let i = 0; i < 3; i++) {
    const along = -0.34 + i * 0.34 + (rand() - 0.5) * 0.08;
    const across = (rand() - 0.5) * 0.12;
    const w = 0.32 + rand() * 0.12;
    const h = 0.26 + rand() * 0.2;
    const d = 0.4 + rand() * 0.14;
    lit.add([x + (alongX ? along : across), base + h / 2, z + (alongX ? across : along)], alongX ? [w, h, d] : [d, h, w], pick(rand, HEDGE));
  }
  lit.add([x + (rand() - 0.5) * 0.2, base + 0.42 + rand() * 0.08, z + (rand() - 0.5) * 0.2], [0.24, 0.16, 0.24], pick(rand, HEDGE));
}

/**
 * The undergrowth between a tree and its neighbor east (dx 1) or south
 * (dy 1) on its own, centered on their shared edge, for sinking it away
 * when one of them falls.
 */
export function buildShrub(map: WorldMap, seed: number, tx: number, ty: number, dx: number, dy: number): Group {
  const lit = new VoxelBatch();
  paintShrub(lit, seed, tx, ty, dx === 1, 0, 0, map.level(tx, ty) * LEVEL_HEIGHT);
  const group = new Group();
  group.add(lit.build());
  return group;
}

/**
 * The watchtower above its lowest course, a roofless ruin: every wall
 * column crumbles to its own height (the front lower than the back), with
 * gaps and loose stones on top, and the pillar is a broken stump. Split so
 * the side facing the camera can be cut away while someone is inside:
 * `back` is the north half of the walls, `front` the middle row (with the
 * pillar) and the south half. Null when the map has no tower.
 */
export function buildTower(map: WorldMap, seed: number): { back: Group; front: Group; x: number; y: number; w: number; h: number } | null {
  let x0 = MAP_WIDTH;
  let y0 = MAP_HEIGHT;
  let x1 = -1;
  let y1 = -1;
  for (let ty = 0; ty < MAP_HEIGHT; ty++) {
    for (let tx = 0; tx < MAP_WIDTH; tx++) {
      if (map.get(tx, ty) === 'tower') {
        x0 = Math.min(x0, tx);
        y0 = Math.min(y0, ty);
        x1 = Math.max(x1, tx);
        y1 = Math.max(y1, ty);
      }
    }
  }
  if (x1 < 0) {
    return null;
  }
  const rand = seededRandom(seed ^ 0x7a3e11);
  const back = new VoxelBatch();
  const front = new VoxelBatch();
  const midY = (y0 + y1) / 2;
  const top = map.level(x0, y0) * LEVEL_HEIGHT + TOWER_WALL;
  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      if (map.get(tx, ty) !== 'tower') {
        continue;
      }
      const { x, z } = toWorld(tx + 0.5, ty + 0.5);
      const batch = ty < midY ? back : front;
      const floor = map.level(tx, ty) * LEVEL_HEIGHT;
      const bottom = floor + TOWER_COURSE;
      const edge = tx === x0 || tx === x1 || ty === y0 || ty === y1;
      const full = edge ? top : floor + TOWER_PILLAR;
      const height = full - (edge ? rand() * (ty > midY ? TOWER_CRUMBLE * 1.6 : TOWER_CRUMBLE) : rand() * 0.6);
      for (let y = bottom; y < height - 0.01; y += 0.4) {
        const h = Math.min(0.4, height - y);
        if (edge && y > bottom + 0.8 && rand() < 0.08) {
          continue;
        }
        const jx = (rand() - 0.5) * 0.06;
        const jz = (rand() - 0.5) * 0.06;
        batch.add([x + jx, y + h / 2, z + jz], [1 - rand() * 0.06, h - 0.02, 1 - rand() * 0.06], pick(rand, TOWER_STONE));
      }
      for (let i = Math.floor(rand() * 3); i > 0; i--) {
        const s = 0.2 + rand() * 0.3;
        batch.add([x + (rand() - 0.5) * 0.6, height + s / 2 - 0.05, z + (rand() - 0.5) * 0.6], [s, s * 0.7, s], pick(rand, TOWER_STONE), new Euler(0, rand() * Math.PI, (rand() - 0.5) * 0.4));
      }
      if (rand() < 0.4) {
        batch.add([x + (rand() - 0.5) * 0.4, height + 0.01, z + (rand() - 0.5) * 0.4], [0.4, 0.04, 0.3], pick(rand, MOSS));
      }
    }
  }
  const span = x1 - x0 + 1;
  const group = (batch: VoxelBatch): Group => {
    const g = new Group();
    g.add(batch.build());
    return g;
  };
  return { back: group(back), front: group(front), x: x0, y: y0, w: span, h: y1 - y0 + 1 };
}

/**
 * Just the contents of one tile (no ground), centered on the origin, looking
 * exactly as it does in the full build.
 */
export function buildTile(map: WorldMap, seed: number, tx: number, ty: number): Group {
  const lit = new VoxelBatch();
  const glow = new VoxelBatch();
  PAINTERS[map.get(tx, ty)]?.(tilePaint(map, seed, tx, ty, lit, glow, 0, 0));
  const group = new Group();
  group.add(lit.build(), glow.build(true));
  return group;
}

/**
 * The contents of one tile as loose boxes in world space (big boxes cut
 * into chunks no longer than `chunk`), for breaking it apart.
 */
export function buildTilePieces(
  map: WorldMap,
  seed: number,
  tx: number,
  ty: number,
  material: (color: string, glow: boolean) => MeshLambertMaterial | MeshBasicMaterial,
  chunk: number,
): Mesh[] {
  const lit = new VoxelBatch();
  const glow = new VoxelBatch();
  const { x, z } = toWorld(tx + 0.5, ty + 0.5);
  PAINTERS[map.get(tx, ty)]?.(tilePaint(map, seed, tx, ty, lit, glow, x, z));
  return [
    ...lit.pieces((color: string) => material(color, false), chunk),
    ...glow.pieces((color: string) => material(color, true), chunk),
  ];
}

/**
 * The painter inputs for a tile, with its per-tile PRNG.
 */
function tilePaint(map: WorldMap, seed: number, tx: number, ty: number, lit: VoxelBatch, glow: VoxelBatch, x: number, z: number): Paint {
  const tile = map.get(tx, ty);
  const floor = GROUND.has(tile) ? tile : floorUnder(map, tx, ty);
  return {
    lit,
    glow,
    rand: seededRandom(seed ^ Math.imul(ty * MAP_WIDTH + tx + 1, 2654435761)),
    map,
    tx,
    ty,
    x,
    z,
    base: map.level(tx, ty) * LEVEL_HEIGHT,
  };
}

/**
 * Scenery beyond the fence, `spanX` tiles out to the sides and `spanY` out
 * the top and bottom, so the TV fills edge to edge whatever its shape. Dense
 * woods with a few rocks; the band just south of the fence stays low so
 * nothing hides the bottom of the playable map.
 */
export function buildOutskirts(map: WorldMap, seed: number, spanX: number, spanY: number): Group {
  const lit = new VoxelBatch();
  const glow = new VoxelBatch();
  for (let ty = -spanY; ty < MAP_HEIGHT + spanY; ty++) {
    for (let tx = -spanX; tx < MAP_WIDTH + spanX; tx++) {
      if (tx >= 0 && ty >= 0 && tx < MAP_WIDTH && ty < MAP_HEIGHT) {
        continue;
      }
      const { x, z } = toWorld(tx + 0.5, ty + 0.5);
      const p: Paint = {
        lit,
        glow,
        rand: seededRandom(seed ^ Math.imul((ty + 1000) * 4096 + tx + 1000, 2246822519)),
        map,
        tx,
        ty,
        x,
        z,
        base: 0,
      };
      quad(p, 0, GRASS, 0.05);
      const roll = p.rand();
      if (ty >= MAP_HEIGHT && ty < MAP_HEIGHT + 2) {
        grassDecor(p);
      } else if (roll < 0.6) {
        PAINTERS.tree!(p);
      } else if (roll < 0.66) {
        PAINTERS.rock!(p);
      } else {
        grassDecor(p);
      }
    }
  }
  const group = new Group();
  group.add(lit.build(), glow.build(true));
  return group;
}

/**
 * The middle front tile of a mausoleum, which gets the door and lantern.
 */
function isMausoleumDoor(map: WorldMap, tx: number, ty: number): boolean {
  return map.get(tx, ty) === 'mausoleum' && map.get(tx, ty + 1) !== 'mausoleum' && map.get(tx - 1, ty) === 'mausoleum' && map.get(tx + 1, ty) === 'mausoleum';
}

/**
 * The most common floor among a tile's neighbors, so a statue on a hill
 * stands on the hill and a wall built on a path has dirt under it.
 */
function floorUnder(map: WorldMap, tx: number, ty: number): Tile {
  const counts = new Map<Tile, number>();
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const n = map.get(tx + dx, ty + dy);
    const floor = n === 'spawn' ? 'path' : n;
    if (FLOORS.includes(floor)) {
      counts.set(floor, (counts.get(floor) ?? 0) + 1);
    }
  }
  let best: Tile = 'grass';
  let bestCount = 0;
  for (const [floor, count] of counts) {
    if (count > bestCount) {
      best = floor;
      bestCount = count;
    }
  }
  return best;
}

/**
 * A stone bank under a raised tile, down to its lowest neighbor, with a
 * pale stone lip along each edge that drops away (so terraces read in the
 * dark) and a few stones jutting from the face below.
 */
function paintTerrain(p: Paint): void {
  const { map, tx, ty, lit, rand, x, z, base } = p;
  if (!map.rampUp(tx, ty)) {
    for (const [dx, dy] of SIDES) {
      if (map.level(tx + dx, ty + dy) * LEVEL_HEIGHT > base && !ledTo(map, tx + dx, ty + dy, -dx, -dy)) {
        lit.add([x + dx * 0.4, base + 0.06, z + dy * 0.4], [dx !== 0 ? 0.2 : 1, 0.02, dy !== 0 ? 0.2 : 1], FOOT);
      }
    }
  }
  let lowest = base;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      lowest = Math.min(lowest, map.level(tx + dx, ty + dy) * LEVEL_HEIGHT);
    }
  }
  if (lowest >= base) {
    return;
  }
  const bottom = lowest - 0.5;
  const top = base - 0.3;
  lit.add([x, (bottom + top) / 2, z], [1, top - bottom, 1], MORTAR);
  for (const [dx, dy] of SIDES) {
    const below = map.level(tx + dx, ty + dy) * LEVEL_HEIGHT;
    if (below < base && !ledTo(map, tx + dx, ty + dy, -dx, -dy)) {
      retainingWall(p, dx, dy, below, base);
    }
  }
}

const SIDES: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];

/**
 * Whether the tile at (tx, ty) is a ramp rising in direction (dx, dy).
 */
function ledTo(map: WorldMap, tx: number, ty: number, dx: number, dy: number): boolean {
  const up = map.rampUp(tx, ty);
  return !!up && up[0] === dx && up[1] === dy;
}

/**
 * Rough coursed stone down the side of a raised tile that drops toward
 * (dx, dy): stones of uneven length and depth, the odd one missing, a
 * broken rim of capstones at different heights along the top, and rubble
 * at the foot.
 */
function retainingWall(p: Paint, dx: number, dy: number, below: number, base: number): void {
  const { lit, rand, x, z } = p;
  const at = (along: number, out: number, y: number): [number, number, number] =>
    [x + dx * out + (dy !== 0 ? along : 0), y, z + dy * out + (dx !== 0 ? along : 0)];
  const size = (length: number, height: number, depth: number): [number, number, number] =>
    [dx !== 0 ? depth : length, height, dy !== 0 ? depth : length];
  const rows = Math.max(1, Math.round((base - below) / WALL_COURSE));
  const h = (base - below) / rows;
  for (let row = 0; row < rows; row++) {
    const y = below + h * (row + 0.5);
    let start = -0.5 - rand() * 0.2;
    while (start < 0.5) {
      const length = 0.2 + rand() * 0.35;
      const end = Math.min(0.5, start + length);
      const from = Math.max(-0.5, start);
      if (end - from > 0.06 && (row === rows - 1 || rand() > 0.06)) {
        const depth = 0.12 + rand() * 0.1;
        lit.add(at((from + end) / 2, 0.5 + rand() * 0.05 - depth / 2, y + (rand() - 0.5) * 0.04), size(end - from - 0.03, h - 0.02 - rand() * 0.05, depth), pick(rand, WALL_STONE));
      }
      start = end;
    }
  }
  let start = -0.5;
  while (start < 0.5) {
    const length = Math.min(0.5 - start, 0.15 + rand() * 0.35);
    if (rand() > 0.15) {
      const height = 0.04 + rand() * 0.12;
      lit.add(at(start + length / 2, 0.44 + rand() * 0.06, base + height / 2 - 0.02), size(length - 0.02, height, 0.12 + rand() * 0.1), pick(rand, LIP), new Euler(0, (rand() - 0.5) * 0.25, 0));
    }
    start += length;
  }
  for (let i = Math.floor(rand() * 3); i > 0; i--) {
    const s = 0.08 + rand() * 0.14;
    lit.add(at((rand() - 0.5) * 0.9, 0.56 + rand() * 0.2, below + s / 2), [s, s * 0.7, s], pick(rand, WALL_STONE), new Euler(0, rand() * Math.PI, 0));
  }
  if (rand() < 0.3) {
    lit.add([x + dx * 0.52 + (dy !== 0 ? (rand() - 0.5) * 0.6 : 0), below + (base - below) * rand(), z + dy * 0.52 + (dx !== 0 ? (rand() - 0.5) * 0.6 : 0)], [dx !== 0 ? 0.04 : 0.25, 0.18, dy !== 0 ? 0.04 : 0.25], pick(rand, MOSS));
  }
}

/**
 * Lifts boxes painted as if at ground level onto a tile's terrain.
 */
function lifted(batch: Batch, by: number): Batch {
  return { add: (pos, size, color, rot): void => batch.add([pos[0], pos[1] + by, pos[2]], size, color, rot) };
}

function paintGround(p: Paint, floor: Tile): void {
  paintTerrain(p);
  if (floor === 'stairs') {
    paintStairs(p);
    return;
  }
  const g = { ...p, lit: lifted(p.lit, p.base), base: 0 };
  const { lit, rand, x, z } = g;
  switch (floor) {
    case 'path':
    case 'spawn':
      quad(g, 0, DIRT, 0);
      if (rand() < 0.3) {
        lit.add([x + (rand() - 0.5) * 0.7, 0.03, z + (rand() - 0.5) * 0.7], [0.1, 0.06, 0.08], pick(rand, PEBBLE));
      }
      return;
    case 'mound':
      quad(g, 0, DIRT, 0.04);
      lit.add([x, 0.01, z - 0.08], [0.46, 0.02, 0.6], PIT);
      lit.add([x + (rand() - 0.5) * 0.06, 0.03, z - 0.34], [0.42, 0.06, 0.1], pick(rand, STONE), new Euler(0, (rand() - 0.5) * 0.3, 0));
      for (let i = 0; i < 6; i++) {
        const s = 0.14 + rand() * 0.14;
        lit.add([x + (rand() - 0.5) * 0.8, s * 0.3, z + 0.28 + (rand() - 0.5) * 0.24], [s, s * 0.6, s * 0.8], pick(rand, DIRT), new Euler(0, rand() * Math.PI, 0));
      }
      return;
    case 'cobble':
      lit.add([x, -0.26, z], [1, 0.48, 1], GROUT);
      for (let sy = 0; sy < 3; sy++) {
        for (let sx = 0; sx < 3; sx++) {
          const h = 0.03 + rand() * 0.02;
          const nudge = sy % 2 ? 0.08 : 0;
          lit.add([x - 0.33 + sx * 0.33 + nudge, -0.02 + h / 2, z - 0.33 + sy * 0.33], [0.31, h, 0.31], pick(rand, COBBLE));
        }
      }
      return;
    case 'flagstone':
      lit.add([x, -0.26, z], [1, 0.48, 1], GROUT);
      for (let sy = 0; sy < 2; sy++) {
        for (let sx = 0; sx < 2; sx++) {
          lit.add([x - 0.25 + sx * 0.5, 0, z - 0.25 + sy * 0.5], [0.49, 0.04, 0.49], pick(rand, FLAG));
        }
      }
      return;
    default:
      quad(g, 0, GRASS_BY_LEVEL[p.map.level(p.tx, p.ty)], 0.05);
      if (floor === 'grass' && GROUND.has(p.map.get(p.tx, p.ty))) {
        grassDecor(g);
      }
  }
}

/**
 * A 2x2 patch of ground sub-voxels whose tops sit at `top`, with a little
 * height jitter for texture.
 */
function quad(p: Paint, top: number, palette: string[], jitter: number): void {
  for (let sy = 0; sy < 2; sy++) {
    for (let sx = 0; sx < 2; sx++) {
      const h = 0.5 + p.rand() * jitter;
      p.lit.add([p.x - 0.25 + sx * 0.5, top + h / 2 - 0.5, p.z - 0.25 + sy * 0.5], [0.5, h, 0.5], pick(p.rand, palette));
    }
  }
}

/**
 * Tufts, moss, fallen leaves, and the odd mushroom cluster.
 */
function grassDecor(p: Paint): void {
  const { lit, rand, x, z, base } = p;
  const tufts = Math.floor(rand() * 3);
  for (let i = 0; i < tufts; i++) {
    const th = 0.08 + rand() * 0.12;
    lit.add([x + (rand() - 0.5) * 0.8, base + th / 2, z + (rand() - 0.5) * 0.8], [0.07, th, 0.07], pick(rand, rand() < 0.5 ? DEAD_GRASS : GRASS));
  }
  const roll = rand();
  if (roll < 0.08) {
    lit.add([x + (rand() - 0.5) * 0.4, base + 0.01, z + (rand() - 0.5) * 0.4], [0.5, 0.02, 0.4], pick(rand, MOSS));
  } else if (roll < 0.18) {
    for (let i = 0; i < 3; i++) {
      lit.add([x + (rand() - 0.5) * 0.8, base + 0.01, z + (rand() - 0.5) * 0.8], [0.1, 0.015, 0.08], pick(rand, LEAVES), new Euler(0, rand() * Math.PI, 0));
    }
  } else if (roll < 0.23) {
    const cap = pick(rand, MUSHROOM_CAP);
    for (let i = 0; i < 2 + Math.floor(rand() * 2); i++) {
      const mx = x + (rand() - 0.5) * 0.6;
      const mz = z + (rand() - 0.5) * 0.6;
      lit.add([mx, base + 0.04, mz], [0.04, 0.08, 0.04], MUSHROOM_STEM);
      lit.add([mx, base + 0.09, mz], [0.11, 0.04, 0.11], cap);
    }
  }
}

/**
 * A flagstone gap in the crypt wall: crypt on one side along the wall line,
 * and open ground (not the crypt floor) straight out the other way.
 */
function isDoorway(map: WorldMap, tx: number, ty: number): boolean {
  if (map.get(tx, ty) !== 'flagstone') {
    return false;
  }
  const outside = (t: Tile): boolean => t !== 'flagstone' && t !== 'crypt';
  const inHorizontalWall = (map.get(tx - 1, ty) === 'crypt' || map.get(tx + 1, ty) === 'crypt')
    && (outside(map.get(tx, ty - 1)) || outside(map.get(tx, ty + 1)));
  const inVerticalWall = (map.get(tx, ty - 1) === 'crypt' || map.get(tx, ty + 1) === 'crypt')
    && (outside(map.get(tx - 1, ty)) || outside(map.get(tx + 1, ty)));
  return inHorizontalWall || inVerticalWall;
}

function besideDoorway(map: WorldMap, tx: number, ty: number): boolean {
  return [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]): boolean => isDoorway(map, tx + dx, ty + dy));
}

/**
 * Four steps rising from a ramp tile's level to the higher tile it leads
 * to, in `palette`, on a slab of `under`.
 */
function paintSteps(p: Paint, palette: string[], under: string[]): void {
  const { map, tx, ty, base } = p;
  const [dx, dz] = map.rampUp(tx, ty) ?? [0, -1];
  const rise = Math.max(0.2, map.top(tx, ty) - base);
  p.lit.add([p.x, base - 0.25, p.z], [1, 0.5, 1], pick(p.rand, under));
  for (let i = 0; i < 4; i++) {
    const h = (i + 1) * (rise / 4);
    const offset = -0.375 + i * 0.25;
    const along: [number, number, number] = dx !== 0 ? [0.25, h, 1] : [1, h, 0.25];
    p.lit.add([p.x + dx * offset, base + h / 2, p.z + dz * offset], along, pick(p.rand, palette));
  }
}

/**
 * Stone stairs up to the next level: dark risers under pale treads, with a
 * stepped stone wall up each open side.
 */
function paintStairs(p: Paint): void {
  paintSteps(p, WALL_STONE, COBBLE);
  const { map, tx, ty, base, lit, rand, x, z } = p;
  const [dx, dz] = map.rampUp(tx, ty) ?? [0, -1];
  const top = map.top(tx, ty);
  const rise = Math.max(0.2, top - base);
  for (let i = 0; i < 4; i++) {
    const offset = -0.375 + i * 0.25;
    const y = base + (i + 1) * (rise / 4);
    lit.add([x + dx * (offset - 0.02), y + 0.02, z + dz * (offset - 0.02)], dx !== 0 ? [0.12, 0.04, 0.96] : [0.96, 0.04, 0.12], pick(rand, TREAD));
  }
  for (const side of [1, -1]) {
    const sx = dz * side;
    const sz = dx * side;
    if (map.get(tx + sx, ty + sz) === 'stairs' || map.level(tx + sx, ty + sz) * LEVEL_HEIGHT >= top) {
      continue;
    }
    for (let i = 0; i < 4; i++) {
      const offset = -0.375 + i * 0.25;
      const h = (i + 1) * (rise / 4) + 0.22;
      lit.add([x + sx * 0.45 + dx * offset, base + h / 2, z + sz * 0.45 + dz * offset], [sx !== 0 ? 0.12 : 0.25, h, sz !== 0 ? 0.12 : 0.25], pick(rand, WALL_STONE));
    }
  }
}

type Vec = [number, number, number];

/**
 * Maps points in a frame turned `yaw` about the tile's middle (dx east, y
 * up from its base, dz toward the camera) to world space.
 */
function turned(x: number, z: number, base: number, yaw: number): (dx: number, y: number, dz: number) => Vec {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  return (dx: number, y: number, dz: number): Vec => [x + dx * c + dz * s, base + y, z - dx * s + dz * c];
}

const UP = new Vector3(0, 1, 0);

/**
 * A square rod `w` thick from one point to another.
 *
 * @returns The rod's rotation, for parts that share it.
 */
function stick(b: Batch, from: Vec, to: Vec, w: number, color: string): Euler {
  const dir = new Vector3(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
  const length = dir.length();
  const rot = new Euler().setFromQuaternion(new Quaternion().setFromUnitVectors(UP, dir.normalize()));
  b.add([(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2], [w, length, w], color, rot);
  return rot;
}

/**
 * A bone from one point to another: a shaft with a knobbly end at each.
 */
function bone(b: Batch, from: Vec, to: Vec, w: number, color: string): void {
  const rot = stick(b, from, to, w, color);
  for (const end of [from, to]) {
    b.add(end, [w * 2.1, w * 1.3, w * 1.5], color, rot);
  }
}

/**
 * A skull `s` across centered on local (cx, cy, cz) of a turned frame,
 * facing the frame's +z: cranium, jaw, eye sockets (in `eyes`, so they can
 * glow), nose, and a dark line of teeth.
 */
function skull(b: Batch, at: (dx: number, y: number, dz: number) => Vec, rot: Euler, cx: number, cy: number, cz: number, s: number, color: string, eyes: Batch = b, eyeColor = SOCKET): void {
  const face = cz + s * 0.45 + 0.006;
  b.add(at(cx, cy, cz), [s, s * 0.8, s * 0.9], color, rot);
  b.add(at(cx, cy - s * 0.48, cz + s * 0.12), [s * 0.7, s * 0.24, s * 0.62], color, rot);
  for (const side of [-1, 1]) {
    eyes.add(at(cx + side * s * 0.22, cy - s * 0.04, face), [s * 0.24, s * 0.22, 0.012], eyeColor, rot);
  }
  b.add(at(cx, cy - s * 0.25, face), [s * 0.1, s * 0.1, 0.012], SOCKET, rot);
  b.add(at(cx, cy - s * 0.4, cz + s * 0.43 + 0.006), [s * 0.5, 0.014, 0.012], SOCKET, rot);
}

/**
 * A wax candle with a glowing flame on top.
 */
function candle(lit: Batch, glow: Batch, pos: Vec, h: number): void {
  lit.add([pos[0], pos[1] + h / 2, pos[2]], [0.05, h, 0.05], WAX);
  lit.add([pos[0] + 0.02, pos[1] + 0.012, pos[2] + 0.01], [0.07, 0.024, 0.07], WAX);
  glow.add([pos[0], pos[1] + h + 0.025, pos[2]], [0.03, 0.05, 0.03], CANDLE);
}

type Painter = (p: Paint) => void;

const PAINTERS: Partial<Record<Tile, Painter>> = {
  fence: ({ lit, map, tx, ty, x, z }) => {
    lit.add([x, 0.55, z], [0.14, 1.1, 0.14], IRON);
    lit.add([x, 1.16, z], [0.06, 0.12, 0.06], IRON);
    if (map.get(tx + 1, ty) === 'fence') {
      lit.add([x + 0.5, 0.3, z], [1, 0.06, 0.06], IRON);
      lit.add([x + 0.5, 0.85, z], [1, 0.06, 0.06], IRON);
      lit.add([x + 0.5, 0.6, z], [0.06, 0.8, 0.06], IRON);
    }
    if (map.get(tx, ty + 1) === 'fence') {
      lit.add([x, 0.3, z + 0.5], [0.06, 0.06, 1], IRON);
      lit.add([x, 0.85, z + 0.5], [0.06, 0.06, 1], IRON);
      lit.add([x, 0.6, z + 0.5], [0.06, 0.8, 0.06], IRON);
    }
  },

  tombstone: ({ lit, rand, x, z, base }) => {
    const style = rand();
    const stone = pick(rand, STONE);
    const tilt = new Euler((rand() - 0.5) * 0.15, (rand() - 0.5) * 0.3, (rand() - 0.5) * 0.15);
    lit.add([x, base + 0.04, z + 0.3], [0.5, 0.08, 0.5], pick(rand, DIRT));
    if (style < 0.55) {
      lit.add([x, base + 0.05, z - 0.05], [0.7, 0.1, 0.4], pick(rand, STONE));
      lit.add([x, base + 0.45, z - 0.1], [0.5, 0.7, 0.16], stone, tilt);
      lit.add([x, base + 0.84, z - 0.1], [0.34, 0.1, 0.16], stone, tilt);
    } else if (style < 0.8) {
      lit.add([x, base + 0.1, z - 0.1], [0.4, 0.2, 0.4], pick(rand, STONE));
      lit.add([x, base + 0.7, z - 0.1], [0.2, 1.0, 0.2], stone);
      lit.add([x, base + 1.25, z - 0.1], [0.12, 0.12, 0.12], stone, new Euler(0, Math.PI / 4, 0));
    } else {
      lit.add([x, base + 0.08, z + 0.05], [0.5, 0.16, 0.8], stone, tilt);
      lit.add([x, base + 0.3, z - 0.32], [0.46, 0.4, 0.12], pick(rand, STONE));
    }
  },

  cross: ({ lit, rand, x, z, base }) => {
    const stone = pick(rand, STONE);
    lit.add([x, base + 0.45, z - 0.15], [0.12, 0.9, 0.12], stone);
    lit.add([x, base + 0.62, z - 0.15], [0.5, 0.12, 0.12], stone);
    lit.add([x, base + 0.05, z + 0.2], [0.5, 0.1, 0.7], pick(rand, DIRT));
  },

  tree: (p) => {
    const style = p.rand();
    if (style < 0.5) {
      deadTree(p);
    } else if (style < 0.8) {
      pineTree(p);
    } else {
      twistedTree(p);
    }
  },

  stump: ({ lit, x, z, base }) => {
    lit.add([x, base + 0.1, z], [0.34, 0.2, 0.34], BARK);
    lit.add([x, base + 0.205, z], [0.26, 0.012, 0.26], STUMP_RING);
    lit.add([x + 0.2, base + 0.04, z + 0.05], [0.14, 0.08, 0.08], BARK);
  },

  rock: ({ lit, rand, x, z, base }) => {
    lit.add([x, base + 0.2, z], [0.7, 0.4, 0.6], pick(rand, BOULDER), new Euler(0, rand() * Math.PI, 0));
    lit.add([x + (rand() - 0.5) * 0.2, base + 0.45, z + (rand() - 0.5) * 0.2], [0.42, 0.24, 0.4], pick(rand, BOULDER), new Euler(0, rand() * Math.PI, 0));
    lit.add([x + 0.3, base + 0.08, z + 0.25], [0.2, 0.16, 0.2], pick(rand, STONE));
  },

  pumpkin: ({ lit, glow, x, z, base }) => {
    lit.add([x, base + 0.22, z], [0.6, 0.44, 0.54], PUMPKIN);
    lit.add([x, base + 0.22, z], [0.66, 0.36, 0.3], PUMPKIN);
    lit.add([x, base + 0.5, z], [0.08, 0.14, 0.08], PUMPKIN_STEM);
    glow.add([x - 0.13, base + 0.3, z + 0.272], [0.1, 0.08, 0.02], CANDLE);
    glow.add([x + 0.13, base + 0.3, z + 0.272], [0.1, 0.08, 0.02], CANDLE);
    glow.add([x, base + 0.15, z + 0.272], [0.3, 0.06, 0.02], CANDLE);
  },

  tower: ({ lit, rand, x, z, base }) => {
    lit.add([x, base + TOWER_COURSE / 2, z], [1, TOWER_COURSE, 1], pick(rand, TOWER_STONE));
  },

  platform: ({ lit, rand, map, tx, ty, x, z, base }) => {
    const deck = base + LEVEL_HEIGHT;
    for (const [ox, oz] of [[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]]) {
      lit.add([x + ox, base + LEVEL_HEIGHT / 2, z + oz], [0.12, LEVEL_HEIGHT, 0.12], PLANK_DARK);
    }
    lit.add([x, base + 0.3, z + 0.4], [0.9, 0.06, 0.06], PLANK_DARK, new Euler(0, 0, 0.5));
    lit.add([x + 0.4, base + 0.3, z], [0.06, 0.06, 0.9], PLANK_DARK, new Euler(0.5, 0, 0));
    for (let i = 0; i < 4; i++) {
      lit.add([x - 0.375 + i * 0.25, deck - 0.04, z], [0.23, 0.08, 1], pick(rand, PLANK));
    }
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const n = map.get(tx + dx, ty + dy);
      if (n === 'platform' || n === 'steps' || map.base(tx + dx, ty + dy) >= deck - 0.01) {
        continue;
      }
      lit.add([x + dx * 0.45, deck + 0.25, z + dy * 0.45], dx !== 0 ? [0.06, 0.06, 0.9] : [0.9, 0.06, 0.06], PLANK_DARK);
      lit.add([x + dx * 0.45 + dy * 0.4, deck + 0.13, z + dy * 0.45 + dx * 0.4], [0.06, 0.26, 0.06], PLANK_DARK);
      lit.add([x + dx * 0.45 - dy * 0.4, deck + 0.13, z + dy * 0.45 - dx * 0.4], [0.06, 0.26, 0.06], PLANK_DARK);
    }
  },

  steps: (p) => {
    paintSteps(p, PLANK, [PLANK_DARK]);
  },

  chest: ({ lit, glow, rand, x, z, base }) => {
    const wood = pick(rand, CHEST_WOOD);
    const turn = new Euler(0, (rand() - 0.5) * 0.5, 0);
    const at = (dx: number, y: number, dz: number): [number, number, number] => {
      const c = Math.cos(turn.y);
      const s = Math.sin(turn.y);
      return [x + dx * c + dz * s, base + y, z - dx * s + dz * c];
    };
    lit.add(at(0, 0.17, 0), [0.62, 0.34, 0.42], wood, turn);
    lit.add(at(0, 0.39, 0), [0.66, 0.1, 0.46], wood, turn);
    lit.add(at(0, 0.46, 0), [0.6, 0.06, 0.34], wood, turn);
    for (const dx of [-0.21, 0.21]) {
      lit.add(at(dx, 0.25, 0), [0.06, 0.5, 0.48], CHEST_BAND, turn);
    }
    lit.add(at(0, 0.34, 0.215), [0.68, 0.035, 0.03], CHEST_BAND, turn);
    glow.add(at(0, 0.3, 0.225), [0.08, 0.1, 0.03], GOLD, turn);
  },

  crypt: ({ lit, glow, rand, map, tx, ty, x, z }) => {
    const wall = (dx: number, dy: number): boolean => map.get(tx + dx, ty + dy) === 'crypt';
    const doorBeside = (dx: number, dy: number): boolean => isDoorway(map, tx + dx, ty + dy);
    const corner = (wall(1, 0) || wall(-1, 0)) && (wall(0, 1) || wall(0, -1));
    lit.add([x, 0.1, z], [1.04, 0.2, 1.04], CRYPT_DARK);
    for (let course = 0; course < 3; course++) {
      const cy = 0.4 + course * 0.4;
      const split = course % 2 === 0 ? [[-0.25, 0.49], [0.25, 0.49]] : [[-0.375, 0.24], [0, 0.49], [0.375, 0.24]];
      for (const [offset, w] of split) {
        lit.add([x + offset, cy, z], [w, 0.38, 0.98], pick(rand, CRYPT));
      }
    }
    lit.add([x, 1.45, z], [1.1, 0.1, 1.1], pick(rand, CRYPT_TRIM));
    if (corner) {
      lit.add([x, 1.0, z], [0.6, 2.0, 0.6], pick(rand, CRYPT_TRIM));
      lit.add([x, 2.08, z], [0.7, 0.12, 0.7], CRYPT_DARK);
      lit.add([x, 2.3, z], [0.36, 0.32, 0.36], pick(rand, CRYPT_TRIM));
      lit.add([x, 2.58, z], [0.16, 0.26, 0.16], pick(rand, CRYPT_TRIM));
      lit.add([x, 2.8, z], [0.05, 0.22, 0.05], IRON);
      lit.add([x, 2.84, z], [0.16, 0.05, 0.05], IRON);
      return;
    }
    if ((tx + ty) % 2 === 0) {
      lit.add([x, 1.62, z], [0.5, 0.24, 0.5], pick(rand, CRYPT));
    }
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      if (doorBeside(dx, dy)) {
        lit.add([x + dx * 0.3, 0.9, z + dy * 0.3], [0.34, 1.8, 0.34], pick(rand, CRYPT_TRIM));
        lit.add([x + dx * 0.3, 1.86, z + dy * 0.3], [0.24, 0.14, 0.24], CRYPT_DARK);
        lit.add([x + dx * 0.3, 1.98, z + dy * 0.3], [0.3, 0.1, 0.3], IRON);
        glow.add([x + dx * 0.3, 2.08, z + dy * 0.3], [0.16, 0.12, 0.16], CANDLE);
      }
    }
  },

  mausoleum: ({ lit, glow, rand, map, tx, ty, x, z }) => {
    const same = (dx: number, dy: number): boolean => map.get(tx + dx, ty + dy) === 'mausoleum';
    const w = same(-1, 0) && same(1, 0) ? 1 : 0.96;
    const d = same(0, -1) && same(0, 1) ? 1 : 0.94;
    lit.add([x, 0.45, z], [w, 0.9, d], pick(rand, MARBLE));
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        const h = 0.1 + rand() * 0.45;
        lit.add([x - w / 4 + i * (w / 2), 0.9 + h / 2, z - d / 4 + j * (d / 2)], [w / 2 - 0.02, h, d / 2 - 0.02], pick(rand, MARBLE));
      }
    }
    if (rand() < 0.4) {
      lit.add([x + (rand() - 0.5) * 0.5, 1.0, z + (rand() - 0.5) * 0.5], [0.3, 0.2, 0.22], pick(rand, MARBLE), new Euler(rand() * 0.4, rand(), rand() * 0.4));
    }
    if (!same(0, 1)) {
      lit.add([x - 0.4, 0.6, z + 0.5], [0.14, 1.2, 0.14], pick(rand, MARBLE));
      lit.add([x + 0.4, 0.6, z + 0.5], [0.14, 1.2, 0.14], pick(rand, MARBLE));
      if (same(-1, 0) && same(1, 0)) {
        lit.add([x, 0.42, z + 0.48], [0.42, 0.84, 0.04], DOORWAY);
        lit.add([x, 0.03, z + 0.62], [0.6, 0.06, 0.24], pick(rand, MARBLE));
        lit.add([x, 1.0, z + 0.56], [0.12, 0.04, 0.12], IRON);
        glow.add([x, 0.9, z + 0.56], [0.08, 0.12, 0.08], LAMP_GLASS);
      }
    }
  },

  ruin: ({ lit, rand, map, tx, ty, x, z }) => {
    const alongX = map.get(tx - 1, ty) === 'ruin' || map.get(tx + 1, ty) === 'ruin';
    const alongZ = map.get(tx, ty - 1) === 'ruin' || map.get(tx, ty + 1) === 'ruin';
    const layers = 2 + Math.floor(rand() * 3);
    for (const horizontal of alongX || !alongZ ? [true, ...(alongZ ? [false] : [])] : [false]) {
      for (let layer = 0; layer < layers; layer++) {
        for (let i = 0; i < 2; i++) {
          if (layer > 1 && layer === layers - 1 && rand() < 0.35) {
            continue;
          }
          const offset = -0.25 + i * 0.5 + (layer % 2 ? 0.08 : -0.08);
          const pos: [number, number, number] = horizontal ? [x + offset, 0.15 + layer * 0.3, z] : [x, 0.15 + layer * 0.3, z + offset];
          const size: [number, number, number] = horizontal ? [0.48, 0.28, 0.5] : [0.5, 0.28, 0.48];
          lit.add(pos, size, pick(rand, BRICK));
        }
      }
    }
    if (rand() < 0.5) {
      lit.add([x + (rand() - 0.5) * 0.3, layers * 0.3 + 0.01, z], [0.3, 0.03, 0.4], pick(rand, MOSS));
    }
    lit.add([x + (rand() - 0.5) * 0.8, 0.06, z + (rand() - 0.5) * 0.8], [0.18, 0.12, 0.16], pick(rand, BRICK), new Euler(0, rand(), 0.2));
  },

  well: ({ lit, rand, x, z }) => {
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      lit.add([x + Math.cos(a) * 0.36, 0.25, z + Math.sin(a) * 0.36], [0.24, 0.5, 0.24], pick(rand, STONE), new Euler(0, -a, 0));
    }
    lit.add([x, 0.3, z], [0.5, 0.02, 0.5], WATER);
    lit.add([x - 0.42, 0.75, z], [0.08, 1.5, 0.08], PLANK_DARK);
    lit.add([x + 0.42, 0.75, z], [0.08, 1.5, 0.08], PLANK_DARK);
    lit.add([x, 1.25, z], [0.9, 0.06, 0.06], PLANK_DARK);
    lit.add([x + 0.1, 0.95, z], [0.14, 0.16, 0.14], PLANK_DARK);
  },

  statue: ({ lit, glow, rand, x, z, base }) => {
    const stone = pick(rand, STATUE);
    for (const [cx, ch] of [[-0.18, 0.1], [0.04, 0.14], [0.2, 0.08]]) {
      lit.add([x + cx, base + 0.3 + ch / 2, z + 0.36], [0.05, ch, 0.05], MUSHROOM_STEM);
      glow.add([x + cx, base + 0.32 + ch, z + 0.36], [0.03, 0.05, 0.03], CANDLE);
    }
    const facing = new Euler(0, (rand() - 0.5) * 0.4, 0);
    lit.add([x, base + 0.15, z], [0.62, 0.3, 0.62], pick(rand, STONE));
    lit.add([x, base + 0.62, z], [0.3, 0.64, 0.24], stone, facing);
    lit.add([x, base + 1.04, z], [0.18, 0.2, 0.18], stone, facing);
    lit.add([x - 0.2, base + 0.85, z - 0.12], [0.08, 0.55, 0.3], stone, new Euler(0.2, 0.3, 0.3));
    lit.add([x + 0.2, base + 0.85, z - 0.12], [0.08, 0.55, 0.3], stone, new Euler(0.2, -0.3, -0.3));
    if (rand() < 0.6) {
      lit.add([x - 0.1, base + 0.32, z + 0.2], [0.3, 0.04, 0.2], pick(rand, MOSS));
    }
  },

  lamp: ({ lit, glow, x, z, base }) => {
    lit.add([x, base + 0.05, z], [0.24, 0.1, 0.24], IRON);
    lit.add([x, base + 0.7, z], [0.08, 1.3, 0.08], IRON);
    lit.add([x, base + 1.32, z], [0.26, 0.05, 0.26], IRON);
    lit.add([x, base + 1.58, z], [0.26, 0.05, 0.26], IRON);
    glow.add([x, base + 1.45, z], [0.16, 0.22, 0.16], LAMP_GLASS);
  },

  hedge: ({ lit, rand, map, tx, ty, x, z }) => {
    const wide = map.get(tx - 1, ty) === 'hedge' || map.get(tx + 1, ty) === 'hedge';
    lit.add([x, 0.35, z], [wide ? 1 : 0.85, 0.7, wide ? 0.85 : 1], pick(rand, HEDGE));
    for (let i = 0; i < 3; i++) {
      lit.add([x + (rand() - 0.5) * 0.6, 0.7 + rand() * 0.1, z + (rand() - 0.5) * 0.5], [0.3, 0.2, 0.3], pick(rand, HEDGE));
    }
  },

  'wood-wall': ({ lit, rand, x, z, base }) => {
    for (let i = 0; i < 4; i++) {
      const h = 1 + rand() * 0.15;
      const px = x - 0.375 + i * 0.25;
      lit.add([px, base + h / 2, z], [0.23, h, 0.3], pick(rand, PLANK));
      lit.add([px, base + h + 0.04, z], [0.12, 0.08, 0.12], pick(rand, PLANK));
    }
    lit.add([x, base + 0.3, z + 0.16], [1, 0.08, 0.04], PLANK_DARK);
    lit.add([x, base + 0.75, z + 0.16], [1, 0.08, 0.04], PLANK_DARK);
  },

  'stone-wall': ({ lit, rand, x, z, base }) => {
    for (let row = 0; row < 3; row++) {
      const by = base + 0.15 + row * 0.3;
      const bricks: [number, number][] = row % 2 === 0 ? [[-0.25, 0.48], [0.25, 0.48]] : [[-0.375, 0.23], [0, 0.48], [0.375, 0.23]];
      for (const [bx, w] of bricks) {
        lit.add([x + bx, by, z], [w, 0.28, 0.9], pick(rand, BRICK));
      }
    }
  },

  'palisade': ({ lit, rand, map, tx, ty, x, z, base }) => {
    const joins = (dx: number, dy: number): boolean => WALLS.has(map.get(tx + dx, ty + dy));
    const alongZ = joins(0, 1) || joins(0, -1);
    const alongX = joins(1, 0) || joins(-1, 0) || !alongZ;
    for (const horizontal of [alongX, alongZ].flatMap((on: boolean, i: number): boolean[] => (on ? [i === 0] : []))) {
      const at = (along: number, y: number, out = 0): [number, number, number] => (horizontal ? [x + along, y, z + out] : [x + out, y, z + along]);
      for (let i = 0; i < 4; i++) {
        const along = -0.375 + i * 0.25;
        const h = 1.05 + rand() * 0.2;
        const lean = new Euler((rand() - 0.5) * 0.08, 0, (rand() - 0.5) * 0.08);
        lit.add(at(along, base + h / 2), [0.21, h, 0.21], pick(rand, STAKE), lean);
        lit.add(at(along, base + h + 0.04), [0.13, 0.13, 0.13], pick(rand, STAKE), new Euler(Math.PI / 4, 0, Math.PI / 4));
        lit.add(at(along, base + h + 0.12), [0.05, 0.1, 0.05], STAKE_TIP);
      }
      for (const y of [0.32, 0.82]) {
        lit.add(at(0, base + y, 0.02), horizontal ? [1, 0.06, 0.24] : [0.24, 0.06, 1], ROPE);
      }
    }
  },

  door: ({ lit, rand, map, tx, ty, x, z, base }) => {
    const alongX = map.isSolid(tx - 1, ty) || map.isSolid(tx + 1, ty) || !(map.isSolid(tx, ty - 1) || map.isSolid(tx, ty + 1));
    const rot = new Euler(0, alongX ? 0 : Math.PI / 2, 0);
    const [ox, oz] = alongX ? [0.44, 0] : [0, 0.44];
    lit.add([x - ox, base + 0.55, z - oz], [0.12, 1.1, 0.12], PLANK_DARK);
    lit.add([x + ox, base + 0.55, z + oz], [0.12, 1.1, 0.12], PLANK_DARK);
    lit.add([x, base + 1.05, z], [0.98, 0.1, 0.14], PLANK_DARK, rot);
    lit.add([x, base + 0.48, z], [0.76, 0.9, 0.08], pick(rand, PLANK), rot);
    lit.add([x, base + 0.48, z], [0.78, 0.07, 0.1], PLANK_DARK, rot);
  },

  'wood-fence': ({ lit, rand, map, tx, ty, x, z, base }) => {
    const joins = (dx: number, dy: number): boolean => {
      return WALLS.has(map.get(tx + dx, ty + dy));
    };
    lit.add([x, base + 0.35, z], [0.12, 0.7, 0.12], PLANK_DARK);
    lit.add([x, base + 0.73, z], [0.08, 0.06, 0.08], PLANK_DARK);
    const sides: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => joins(dx, dy)) as [number, number][];
    for (const [dx, dy] of sides.length > 0 ? sides : [[1, 0], [-1, 0]] as [number, number][]) {
      for (const h of [0.25, 0.55]) {
        lit.add([x + dx * 0.25, base + h, z + dy * 0.25], dx !== 0 ? [0.5, 0.07, 0.05] : [0.05, 0.07, 0.5], pick(rand, PLANK));
      }
    }
  },

  spikes: ({ lit, rand, x, z, base }) => {
    lit.add([x, base + 0.04, z], [0.84, 0.08, 0.84], PLANK_DARK);
    for (let sy = 0; sy < 3; sy++) {
      for (let sx = 0; sx < 3; sx++) {
        const sh = 0.25 + rand() * 0.12;
        lit.add([x - 0.27 + sx * 0.27, base + 0.08 + sh / 2, z - 0.27 + sy * 0.27], [0.06, sh, 0.06], IRON_SPIKE);
      }
    }
  },

  scarecrow: ({ lit, rand, x, z, base }) => {
    lit.add([x, base + 0.65, z], [0.1, 1.3, 0.1], PLANK_DARK);
    lit.add([x, base + 1.0, z], [0.95, 0.08, 0.08], PLANK_DARK);
    lit.add([x, base + 0.85, z], [0.36, 0.5, 0.24], pick(rand, BURLAP));
    lit.add([x - 0.48, base + 1.0, z], [0.1, 0.14, 0.1], STRAW);
    lit.add([x + 0.48, base + 1.0, z], [0.1, 0.14, 0.1], STRAW);
    lit.add([x, base + 0.56, z], [0.3, 0.12, 0.2], STRAW);
    lit.add([x, base + 1.26, z], [0.27, 0.27, 0.27], BURLAP[1]);
    lit.add([x - 0.06, base + 1.28, z + 0.14], [0.05, 0.05, 0.02], DOORWAY);
    lit.add([x + 0.06, base + 1.28, z + 0.14], [0.05, 0.05, 0.02], DOORWAY);
    lit.add([x, base + 1.41, z], [0.46, 0.04, 0.46], PLANK_DARK);
    lit.add([x, base + 1.52, z], [0.22, 0.18, 0.22], PLANK_DARK);
  },

  'iron-spikes': ({ lit, rand, x, z, base }) => {
    lit.add([x, base + 0.04, z], [0.88, 0.08, 0.88], IRON);
    for (let sy = 0; sy < 4; sy++) {
      for (let sx = 0; sx < 4; sx++) {
        const sh = 0.32 + rand() * 0.14;
        lit.add([x - 0.3 + sx * 0.2, base + 0.08 + sh / 2, z - 0.3 + sy * 0.2], [0.05, sh, 0.05], IRON_SPIKE);
        lit.add([x - 0.3 + sx * 0.2, base + 0.08 + sh + 0.02, z - 0.3 + sy * 0.2], [0.025, 0.05, 0.025], PALE_IRON);
      }
    }
  },

  'barbed-wire': ({ lit, rand, x, z, base }) => {
    for (const side of [-1, 1]) {
      lit.add([x + side * 0.42, base + 0.3, z], [0.08, 0.6, 0.08], pick(rand, STAKE));
    }
    for (const [y, dz] of [[0.16, -0.03], [0.32, 0.03], [0.48, -0.02]]) {
      lit.add([x, base + y, z + dz], [0.86, 0.02, 0.02], WIRE);
      for (let i = 0; i < 5; i++) {
        lit.add([x - 0.32 + i * 0.16, base + y, z + dz], [0.02, 0.07, 0.07], PALE_IRON, new Euler(0.6, 0, 0.6));
      }
    }
  },

  'ghost-lamp': ({ lit, glow, rand, x, z, base }) => {
    lit.add([x, base + 0.04, z], [0.32, 0.08, 0.32], pick(rand, BONE));
    lit.add([x, base + 0.62, z], [0.1, 1.2, 0.1], BONE[1]);
    lit.add([x, base + 0.35, z], [0.14, 0.05, 0.14], BONE_PACK);
    lit.add([x, base + 1.25, z], [0.32, 0.05, 0.32], PALE_IRON);
    lit.add([x, base + 1.55, z], [0.32, 0.05, 0.32], PALE_IRON);
    lit.add([x, base + 1.62, z], [0.14, 0.1, 0.14], pick(rand, BONE));
    for (const [dx, dz] of [[-0.14, -0.14], [0.14, -0.14], [-0.14, 0.14], [0.14, 0.14]]) {
      lit.add([x + dx, base + 1.4, z + dz], [0.03, 0.3, 0.03], PALE_IRON);
    }
    glow.add([x, base + 1.12, z + 0.06], [0.04, 0.03, 0.01], SOUL_GLOW);
  },

  'soul-fire': ({ lit, glow, rand, x, z, base }) => {
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const bone = i % 3 === 0;
      lit.add([x + Math.cos(a) * 0.38, base + (bone ? 0.1 : 0.08), z + Math.sin(a) * 0.38], bone ? [0.14, 0.14, 0.14] : [0.16, 0.16, 0.16], bone ? pick(rand, BONE) : pick(rand, SOUL_STONE), new Euler(0, a, 0));
      if (bone) {
        glow.add([x + Math.cos(a) * 0.45, base + 0.11, z + Math.sin(a) * 0.45], [0.03, 0.03, 0.03], SOUL_GLOW);
      }
    }
    lit.add([x, base + 0.08, z], [0.5, 0.08, 0.5], SOCKET);
    lit.add([x, base + 0.12, z], [0.5, 0.08, 0.08], pick(rand, BONE), new Euler(0, Math.PI / 4, 0.2));
    lit.add([x, base + 0.12, z], [0.5, 0.08, 0.08], pick(rand, BONE), new Euler(0, -Math.PI / 4, 0.2));
  },

  effigy: ({ lit, glow, rand, x, z, base }) => {
    lit.add([x, base + 0.7, z], [0.09, 1.4, 0.09], pick(rand, STAKE));
    lit.add([x, base + 1.05, z], [0.7, 0.07, 0.07], pick(rand, STAKE), new Euler(0, 0, 0.12));
    lit.add([x, base + 0.75, z], [0.3, 0.5, 0.2], STRAW);
    lit.add([x, base + 0.75, z], [0.32, 0.05, 0.22], ROPE);
    lit.add([x, base + 0.6, z], [0.32, 0.05, 0.22], ROPE);
    lit.add([x, base + 1.25, z], [0.2, 0.18, 0.2], pick(rand, BONE));
    lit.add([x, base + 1.18, z + 0.04], [0.14, 0.06, 0.15], BONE[1]);
    glow.add([x - 0.045, base + 1.27, z + 0.101], [0.04, 0.04, 0.01], '#ff3a2a');
    glow.add([x + 0.045, base + 1.27, z + 0.101], [0.04, 0.04, 0.01], '#ff3a2a');
    for (const side of [-1, 1]) {
      lit.add([x + side * 0.1, base + 1.42, z], [0.04, 0.22, 0.04], pick(rand, STAKE), new Euler(0, 0, -side * 0.5));
      lit.add([x + side * 0.3, base + 0.95, z], [0.03, 0.14, 0.03], ROPE);
      lit.add([x + side * 0.3, base + 0.85, z], [0.06, 0.06, 0.06], pick(rand, BONE));
    }
    candle(lit, glow, [x - 0.25, base, z + 0.2], 0.12);
    candle(lit, glow, [x + 0.22, base, z + 0.24], 0.09);
  },

  obelisk: ({ lit, glow, rand, x, z, base }) => {
    lit.add([x, base + 0.07, z], [0.72, 0.14, 0.72], pick(rand, OBELISK_STONE));
    lit.add([x, base + 0.2, z], [0.5, 0.12, 0.5], pick(rand, OBELISK_STONE));
    lit.add([x, base + 0.95, z], [0.34, 1.4, 0.34], pick(rand, OBELISK_STONE));
    lit.add([x, base + 1.75, z], [0.24, 0.24, 0.24], pick(rand, OBELISK_STONE));
    lit.add([x, base + 1.92, z], [0.12, 0.12, 0.12], pick(rand, OBELISK_STONE), new Euler(0, Math.PI / 4, 0));
    for (const [dx, dz] of [[0.171, 0], [-0.171, 0], [0, 0.171], [0, -0.171]]) {
      for (const y of [0.55, 0.85, 1.2, 1.5]) {
        glow.add([x + dx, base + y + rand() * 0.05, z + dz], [dx ? 0.01 : 0.08, 0.1, dz ? 0.01 : 0.08], RUNE);
      }
    }
  },

  'blood-fountain': ({ lit, glow, rand, x, z, base }) => {
    lit.add([x, base + 0.05, z], [0.8, 0.1, 0.8], pick(rand, ALTAR_STONE));
    lit.add([x, base + 0.3, z], [0.3, 0.45, 0.3], pick(rand, ALTAR_STONE));
    lit.add([x, base + 0.58, z], [0.86, 0.12, 0.86], pick(rand, ALTAR_STONE));
    for (const [dx, dz, w, d] of [[0.39, 0, 0.08, 0.86], [-0.39, 0, 0.08, 0.86], [0, 0.39, 0.86, 0.08], [0, -0.39, 0.86, 0.08]]) {
      lit.add([x + dx, base + 0.7, z + dz], [w, 0.12, d], pick(rand, ALTAR_STONE));
    }
    lit.add([x, base + 0.66, z], [0.7, 0.02, 0.7], BLOOD_POOL);
    lit.add([x, base + 0.85, z], [0.1, 0.4, 0.1], pick(rand, ALTAR_STONE));
    lit.add([x, base + 1.06, z], [0.3, 0.06, 0.3], pick(rand, ALTAR_STONE));
    lit.add([x, base + 1.1, z], [0.24, 0.02, 0.24], BLOOD_POOL);
    glow.add([x, base + 0.675, z], [0.3, 0.005, 0.3], '#c8141f');
    glow.add([x + 0.13, base + 0.9, z], [0.03, 0.18, 0.03], '#c8141f');
  },

  'soul-cage': ({ lit, glow, rand, x, z, base }) => {
    lit.add([x, base + 0.05, z], [0.66, 0.1, 0.66], IRON);
    lit.add([x, base + 1.12, z], [0.62, 0.06, 0.62], IRON);
    for (const [dx, dz] of [[-0.28, -0.28], [0.28, -0.28], [-0.28, 0.28], [0.28, 0.28]]) {
      lit.add([x + dx, base + 0.58, z + dz], [0.06, 1.06, 0.06], pick(rand, BONE));
    }
    for (const [dx, dz] of [[0, -0.28], [0, 0.28], [-0.28, 0], [0.28, 0]]) {
      lit.add([x + dx, base + 0.58, z + dz], [dx ? 0.02 : 0.02, 1.0, 0.02], PALE_IRON);
    }
    lit.add([x, base + 1.24, z], [0.18, 0.16, 0.18], pick(rand, BONE));
    glow.add([x, base + 0.55, z], [0.2, 0.28, 0.2], '#b8ffe0');
    glow.add([x, base + 0.75, z], [0.12, 0.12, 0.12], '#e8fff4');
  },

  mirror: ({ lit, glow, rand, x, z, base }) => {
    const frame = pick(rand, MIRROR_FRAME);
    lit.add([x, base + 0.05, z], [0.7, 0.1, 0.3], frame);
    lit.add([x, base + 0.75, z], [0.68, 1.3, 0.08], frame);
    lit.add([x, base + 1.45, z], [0.4, 0.12, 0.09], frame);
    lit.add([x, base + 0.77, z + 0.045], [0.54, 1.12, 0.01], MIRROR_GLASS);
    lit.add([x + 0.06, base + 0.85, z + 0.052], [0.015, 0.5, 0.005], SOCKET, new Euler(0, 0, 0.4));
    lit.add([x - 0.1, base + 0.6, z + 0.052], [0.015, 0.3, 0.005], SOCKET, new Euler(0, 0, -0.6));
    glow.add([x, base + 1.45, z + 0.05], [0.06, 0.06, 0.01], RUNE);
  },

  torch: ({ lit, rand, x, z, base }) => {
    lit.add([x, base + 0.45, z], [0.12, 0.9, 0.12], PLANK_DARK);
    lit.add([x, base + 0.95, z], [0.2, 0.12, 0.2], pick(rand, PLANK));
    lit.add([x, base + 0.04, z], [0.3, 0.08, 0.3], pick(rand, STONE));
  },

  lantern: ({ lit, rand, x, z, base }) => {
    lit.add([x, base + 0.04, z], [0.3, 0.08, 0.3], pick(rand, STONE));
    lit.add([x, base + 0.6, z], [0.12, 1.2, 0.12], PLANK_DARK);
    lit.add([x, base + 1.22, z], [0.3, 0.05, 0.3], IRON);
    lit.add([x, base + 1.5, z], [0.3, 0.05, 0.3], IRON);
    for (const [dx, dz] of [[-0.13, -0.13], [0.13, -0.13], [-0.13, 0.13], [0.13, 0.13]]) {
      lit.add([x + dx, base + 1.36, z + dz], [0.03, 0.28, 0.03], IRON);
    }
  },

  'research-table': ({ lit, glow, rand, x, z, base }) => {
    for (const [lx, lz] of [[-0.38, -0.22], [0.38, -0.22], [-0.38, 0.22], [0.38, 0.22]]) {
      lit.add([x + lx, base + 0.3, z + lz], [0.08, 0.6, 0.08], PLANK_DARK);
    }
    lit.add([x, base + 0.18, z], [0.76, 0.05, 0.05], PLANK_DARK);
    lit.add([x, base + 0.64, z], [0.9, 0.08, 0.58], pick(rand, PLANK));
    const top = base + 0.68;
    for (let i = 0; i < 3; i++) {
      lit.add([x - 0.22 + rand() * 0.2, top + 0.005 + i * 0.006, z + (rand() - 0.5) * 0.2], [0.2, 0.01, 0.26], pick(rand, PAPER), new Euler(0, (rand() - 0.5) * 0.8, 0));
    }
    const cover = pick(rand, BOOK);
    const turn = new Euler(0, (rand() - 0.5) * 0.4, 0);
    lit.add([x + 0.17, top + 0.015, z + 0.08], [0.36, 0.03, 0.24], cover, turn);
    lit.add([x + 0.17, top + 0.035, z + 0.08], [0.33, 0.015, 0.21], PAPER[2], turn);
    lit.add([x + 0.17, top + 0.04, z + 0.08], [0.015, 0.012, 0.21], PLANK_DARK, turn);
    lit.add([x + 0.3, top + 0.06, z - 0.16], [0.18, 0.12, 0.12], pick(rand, BOOK));
    lit.add([x + 0.3, top + 0.15, z - 0.16], [0.16, 0.06, 0.11], pick(rand, BOOK), new Euler(0, 0.3, 0));
    lit.add([x - 0.05, top + 0.035, z - 0.18], [0.06, 0.07, 0.06], DOORWAY);
    lit.add([x - 0.03, top + 0.11, z - 0.18], [0.015, 0.14, 0.015], PAPER[0], new Euler(0, 0, -0.4));
    lit.add([x - 0.33, top + 0.06, z - 0.17], [0.05, 0.12, 0.05], MUSHROOM_STEM);
    glow.add([x - 0.33, top + 0.15, z - 0.17], [0.03, 0.05, 0.03], CANDLE);
    lit.add([x - 0.33, top + 0.005, z - 0.17], [0.1, 0.01, 0.1], IRON);
  },

  sawmill: ({ lit, rand, x, z, base }) => {
    const bench = base + 0.46;
    for (const lx of [-0.33, 0.33]) {
      for (const side of [-1, 1]) {
        lit.add([x + lx, base + 0.22, z + side * 0.13], [0.07, 0.48, 0.07], PLANK_DARK, new Euler(side * 0.45, 0, 0));
      }
    }
    lit.add([x, bench - 0.04, z], [0.94, 0.08, 0.36], pick(rand, PLANK));
    lit.add([x + 0.05, bench + 0.06, z - 0.05], [0.42, 0.12, 0.12], BARK);
    lit.add([x - 0.165, bench + 0.06, z - 0.05], [0.01, 0.11, 0.11], STUMP_RING);
    const disc = new Euler(0, 0, Math.PI / 4);
    lit.add([x + 0.22, bench + 0.02, z + 0.06], [0.36, 0.36, 0.02], IRON_SPIKE);
    lit.add([x + 0.22, bench + 0.02, z + 0.06], [0.36, 0.36, 0.02], IRON_SPIKE, disc);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      lit.add([x + 0.22 + Math.cos(a) * 0.22, bench + 0.02 + Math.sin(a) * 0.22, z + 0.06], [0.05, 0.05, 0.02], IRON_SPIKE, new Euler(0, 0, a + Math.PI / 4));
    }
    lit.add([x + 0.22, bench + 0.02, z + 0.06], [0.1, 0.1, 0.04], IRON);
    lit.add([x + 0.22, bench - 0.16, z + 0.06], [0.06, 0.24, 0.06], IRON);
    for (let i = 0; i < 2; i++) {
      lit.add([x - 0.05 + rand() * 0.06, base + 0.02 + i * 0.04, z + 0.36], [0.6, 0.035, 0.12], PLANK[i + 1], new Euler(0, (rand() - 0.5) * 0.2, 0));
    }
    lit.add([x + 0.18, base + 0.008, z + 0.2], [0.34, 0.016, 0.26], SAWDUST, new Euler(0, rand(), 0));
  },

  furnace: ({ lit, rand, x, z, base }) => {
    lit.add([x, base + 0.06, z], [0.84, 0.12, 0.78], pick(rand, FURNACE_STONE));
    for (const side of [-1, 1]) {
      for (let row = 0; row < 3; row++) {
        lit.add([x + side * 0.29, base + 0.22 + row * 0.2, z], [0.22, 0.19, 0.72 - rand() * 0.04], pick(rand, FURNACE_STONE));
      }
    }
    lit.add([x, base + 0.42, z - 0.24], [0.4, 0.6, 0.24], pick(rand, FURNACE_STONE));
    lit.add([x, base + 0.13, z + 0.06], [0.36, 0.03, 0.56], EMBER_STONE);
    lit.add([x, base + 0.6, z + 0.03], [0.4, 0.24, 0.66], pick(rand, FURNACE_STONE));
    lit.add([x, base + 0.53, z + 0.34], [0.46, 0.1, 0.08], pick(rand, BRICK));
    lit.add([x, base + 0.81, z], [0.8, 0.18, 0.74], pick(rand, FURNACE_STONE));
    lit.add([x, base + 0.96, z - 0.02], [0.58, 0.14, 0.52], pick(rand, FURNACE_STONE));
    lit.add([x, base + 0.63, z + 0.372], [0.24, 0.07, 0.01], SOOT);
    lit.add([x + 0.14, base + 1.24, z - 0.14], [0.24, 0.46, 0.24], pick(rand, BRICK));
    lit.add([x + 0.14, base + 1.49, z - 0.14], [0.3, 0.06, 0.3], SOOT);
    for (const bx of [-0.12, 0, 0.12]) {
      lit.add([x + bx, base + 0.15, z + 0.33], [0.03, 0.03, 0.08], IRON);
    }
    for (let i = 0; i < 2; i++) {
      const s = 0.1 + rand() * 0.06;
      lit.add([x - 0.3 + i * 0.12, base + s / 2, z + 0.44], [s, s * 0.8, s], pick(rand, STONE), new Euler(0, rand() * Math.PI, 0));
    }
  },

  campfire: ({ lit, rand, x, z, base }) => {
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      lit.add([x + Math.cos(a) * 0.36, base + 0.07, z + Math.sin(a) * 0.36], [0.17, 0.14, 0.17], i % 2 ? EMBER_STONE : pick(rand, STONE), new Euler(0, a, 0));
    }
    lit.add([x, base + 0.1, z], [0.56, 0.1, 0.1], pick(rand, PLANK), new Euler(0, Math.PI / 4, 0.25));
    lit.add([x, base + 0.1, z], [0.56, 0.1, 0.1], pick(rand, PLANK), new Euler(0, -Math.PI / 4, 0.25));
    lit.add([x, base + 0.14, z], [0.5, 0.1, 0.1], pick(rand, PLANK), new Euler(0, Math.PI / 2, -0.2));
  },

  altar: ({ lit, glow, rand, x, z, base }) => {
    const at = turned(x, z, base, 0);
    const none = new Euler();
    const stone = (): string => pick(rand, ALTAR_STONE);
    lit.add([x, base + 0.05, z], [0.96, 0.1, 0.86], stone());
    lit.add([x, base + 0.14, z], [0.86, 0.08, 0.74], stone());
    lit.add([x, base + 0.36, z], [0.68, 0.36, 0.52], stone());
    for (const side of [-1, 1]) {
      lit.add([x + side * 0.33, base + 0.36, z + 0.24], [0.13, 0.36, 0.13], stone());
      lit.add([x + side * 0.33, base + 0.36, z - 0.24], [0.13, 0.36, 0.13], stone());
    }
    lit.add([x, base + 0.59, z], [0.92, 0.1, 0.7], stone());
    lit.add([x, base + 0.645, z], [0.84, 0.02, 0.62], ALTAR_STONE[2]);
    skull(lit, at, none, 0, 0.4, 0.22, 0.16, BONE[1]);
    for (const side of [-1, 1]) {
      bone(lit, at(side * 0.06, 0.28, 0.27), at(side * 0.2, 0.42, 0.27), 0.03, BONE[3]);
    }
    const top = base + 0.655;
    lit.add([x, top + 0.004, z + 0.265], [0.68, 0.012, 0.15], ALTAR_TROUGH);
    lit.add([x, top + 0.04, z - 0.06], [0.32, 0.08, 0.28], ALTAR_STONE[1]);
    glow.add([x, top + 0.085, z - 0.06], [0.24, 0.012, 0.2], BLOOD_POOL);
    for (let i = 0; i < 3; i++) {
      lit.add([x + (rand() - 0.5) * 0.6, top + 0.004, z + 0.1 + (rand() - 0.5) * 0.3], [0.08 + rand() * 0.14, 0.008, 0.06 + rand() * 0.1], pick(rand, BLOOD_STAIN), new Euler(0, rand() * Math.PI, 0));
    }
    for (let i = 0; i < 3; i++) {
      const dx = (i - 1) * 0.2 + (rand() - 0.5) * 0.1;
      const h = 0.1 + rand() * 0.2;
      const stain = pick(rand, BLOOD_STAIN);
      lit.add([x + dx, base + 0.6, z + 0.356], [0.045, 0.1, 0.012], stain);
      lit.add([x + dx, base + 0.54 - h / 2, z + 0.266], [0.035, h, 0.012], stain);
    }
    lit.add([x + 0.1, base + 0.185, z + 0.32], [0.18, 0.01, 0.1], BLOOD_STAIN[0]);
    for (const [cx, cz, h] of [[-0.38, -0.27, 0.16], [-0.3, -0.3, 0.1], [0.38, 0.27, 0.12], [-0.38, 0.27, 0.08]]) {
      candle(lit, glow, [x + cx, top, z + cz], h);
    }
    skull(lit, at, new Euler(0, -0.4, 0), 0.26, 0.755, -0.18, 0.17, BONE[0]);
    bone(lit, at(-0.3, 0.68, 0.02), at(-0.06, 0.68, 0.16), 0.035, BONE[2]);
    for (const side of [-1, 1]) {
      const root: Vec = [x + side * 0.4, top, z - 0.3];
      const bend: Vec = [x + side * 0.5, top + 0.3, z - 0.32];
      const tip: Vec = [x + side * 0.42, top + 0.52, z - 0.26];
      stick(lit, root, bend, 0.08, BONE[1]);
      stick(lit, bend, tip, 0.05, BONE[0]);
    }
    skull(lit, at, new Euler(0, 0.5, 0), -0.36, 0.17, 0.36, 0.14, BONE[3]);
    bone(lit, at(0.2, 0.12, 0.4), at(0.42, 0.12, 0.33), 0.03, BONE[1]);
  },

  bloodforge: ({ lit, glow, rand, x, z, base }) => {
    const stone = (): string => pick(rand, FORGE_STONE);
    lit.add([x, base + 0.06, z], [0.9, 0.12, 0.84], stone());
    for (const side of [-1, 1]) {
      for (let row = 0; row < 3; row++) {
        lit.add([x + side * 0.25, base + 0.22 + row * 0.2, z - 0.04], [0.2, 0.19, 0.66 - rand() * 0.04], stone());
      }
      lit.add([x + side * 0.36, base + 0.45, z + 0.29], [0.05, 0.66, 0.05], FORGE_IRON);
    }
    lit.add([x, base + 0.42, z - 0.3], [0.32, 0.6, 0.16], stone());
    lit.add([x, base + 0.13, z + 0.02], [0.3, 0.03, 0.5], FORGE_FLOOR);
    lit.add([x, base + 0.6, z - 0.04], [0.34, 0.24, 0.62], stone());
    lit.add([x, base + 0.52, z + 0.29], [0.36, 0.08, 0.06], pick(rand, BLOODSTEEL));
    lit.add([x, base + 0.8, z - 0.04], [0.78, 0.18, 0.7], stone());
    lit.add([x, base + 0.74, z + 0.31], [0.8, 0.04, 0.03], FORGE_IRON);
    skull(lit, turned(x, z, base, 0), new Euler(), 0, 0.82, 0.3, 0.14, BONE[1]);
    lit.add([x, base + 0.95, z - 0.06], [0.52, 0.12, 0.5], stone());
    for (const [cx, cz] of [[-0.33, 0.25], [0.33, 0.25], [-0.33, -0.33], [0.33, -0.33]]) {
      lit.add([x + cx, base + 0.93, z + cz], [0.07, 0.08, 0.07], FORGE_IRON);
      lit.add([x + cx, base + 1.0, z + cz], [0.04, 0.08, 0.04], pick(rand, BLOODSTEEL));
    }
    lit.add([x - 0.12, base + 1.22, z - 0.18], [0.2, 0.42, 0.2], FORGE_IRON);
    lit.add([x - 0.12, base + 1.45, z - 0.18], [0.26, 0.05, 0.26], pick(rand, BLOODSTEEL));
    lit.add([x - 0.12, base + 1.1, z - 0.07], [0.22, 0.03, 0.01], BLOODSTEEL[0]);
    const cx = x + 0.3;
    const cz = z + 0.32;
    lit.add([cx, base + 0.2, cz], [0.24, 0.16, 0.22], FORGE_IRON);
    lit.add([cx, base + 0.29, cz], [0.28, 0.04, 0.26], FORGE_IRON);
    glow.add([cx, base + 0.305, cz], [0.2, 0.01, 0.18], BLOOD_POOL);
    for (const side of [-1, 1]) {
      lit.add([cx + side * 0.15, base + 0.16, cz], [0.03, 0.08, 0.03], FORGE_IRON);
    }
    lit.add([cx - 0.04, base + 0.311, cz + 0.135], [0.04, 0.03, 0.02], BLOOD_STAIN[1]);
    lit.add([x - 0.3, base + 0.145, z + 0.32], [0.08, 0.05, 0.18], BLOODSTEEL[1]);
    lit.add([x - 0.21, base + 0.145, z + 0.32], [0.08, 0.05, 0.18], BLOODSTEEL[0]);
    lit.add([x - 0.255, base + 0.195, z + 0.32], [0.08, 0.05, 0.18], BLOODSTEEL[2]);
  },

  sifter: ({ lit, glow, rand, x, z, base }) => {
    lit.add([x, base + 0.03, z], [0.72, 0.04, 0.44], PLANK_DARK);
    for (const side of [-1, 1]) {
      lit.add([x, base + 0.12, z + side * 0.22], [0.76, 0.2, 0.04], pick(rand, PLANK));
      lit.add([x + side * 0.36, base + 0.12, z], [0.04, 0.2, 0.44], pick(rand, PLANK));
    }
    lit.add([x, base + 0.13, z], [0.66, 0.08, 0.38], pick(rand, GRIT));
    for (let i = 0; i < 4; i++) {
      lit.add([x + (rand() - 0.5) * 0.56, base + 0.18, z + (rand() - 0.5) * 0.3], [0.08, 0.03, 0.07], pick(rand, GRIT), new Euler(0, rand() * Math.PI, 0));
    }
    for (let i = 0; i < 3; i++) {
      glow.add([x + (rand() - 0.5) * 0.5, base + 0.175, z + (rand() - 0.5) * 0.28], [0.035, 0.02, 0.035], SILVER_FLECK);
    }
    for (const [lx, lz] of [[-0.4, -0.27], [0.4, -0.27], [-0.4, 0.27], [0.4, 0.27]]) {
      lit.add([x + lx, base + 0.36, z + lz], [0.07, 0.72, 0.07], PLANK_DARK);
    }
    const tray = base + 0.6;
    for (const side of [-1, 1]) {
      lit.add([x, tray, z + side * 0.25], [0.76, 0.08, 0.05], pick(rand, PLANK));
      lit.add([x + side * 0.37, tray, z], [0.05, 0.08, 0.5], pick(rand, PLANK));
      lit.add([x + side * 0.47, tray, z], [0.16, 0.04, 0.05], PLANK_DARK);
    }
    for (let i = 0; i < 6; i++) {
      lit.add([x - 0.3 + i * 0.12, tray - 0.02, z], [0.016, 0.016, 0.46], MESH_WIRE);
    }
    for (let i = 0; i < 4; i++) {
      lit.add([x, tray - 0.02, z - 0.18 + i * 0.12], [0.7, 0.016, 0.016], MESH_WIRE);
    }
    for (let i = 0; i < 3; i++) {
      const s = 0.07 + rand() * 0.05;
      lit.add([x + (rand() - 0.5) * 0.4, tray + s * 0.3, z + (rand() - 0.5) * 0.24], [s, s * 0.6, s], pick(rand, GRIT), new Euler(0, rand() * Math.PI, 0));
    }
    const hx = x + 0.3;
    const hz = z + 0.38;
    lit.add([hx, base + 0.04, hz], [0.3, 0.08, 0.16], pick(rand, GRIT));
    lit.add([hx - 0.02, base + 0.1, hz], [0.18, 0.06, 0.12], pick(rand, GRIT));
    lit.add([hx - 0.03, base + 0.14, hz], [0.08, 0.04, 0.07], pick(rand, GRIT));
    glow.add([hx + 0.08, base + 0.085, hz + 0.05], [0.03, 0.02, 0.03], SILVER_FLECK);
    lit.add([hx - 0.1, base + 0.09, hz + 0.06], [0.05, 0.03, 0.05], SILVER[0]);
  },

  sentry: ({ lit, glow, rand, x, z, base }) => {
    const yaw = (rand() < 0.5 ? -1 : 1) * (0.5 + rand() * 0.4);
    const at = turned(x, z, base, yaw);
    const turn = new Euler(0, yaw, 0);
    const hub = at(0, 0.5, 0);
    for (let i = 0; i < 3; i++) {
      const a = Math.PI / 2 + (i / 3) * Math.PI * 2;
      bone(lit, [x + Math.cos(a) * 0.38, base + 0.03, z - Math.sin(a) * 0.36], hub, 0.05, pick(rand, BONE));
    }
    lit.add(hub, [0.16, 0.08, 0.16], FORGE_IRON, turn);
    lit.add(at(0, 0.56, 0), [0.08, 0.06, 0.08], pick(rand, BLOODSTEEL), turn);
    skull(lit, at, turn, 0, 0.75, 0, 0.3, BONE[0], glow, SENTRY_EYE);
    lit.add(at(0, 0.62, 0.3), [0.1, 0.1, 0.32], BLOODSTEEL[1], turn);
    lit.add(at(0, 0.62, 0.2), [0.13, 0.13, 0.05], FORGE_IRON, turn);
    lit.add(at(0, 0.62, 0.46), [0.14, 0.14, 0.05], BLOODSTEEL[0], turn);
    lit.add(at(0, 0.62, 0.487), [0.07, 0.07, 0.01], PIT, turn);
    lit.add(at(0, 0.89, -0.06), [0.12, 0.03, 0.12], FORGE_IRON, turn);
    lit.add(at(0, 0.91, -0.06), [0.1, 0.03, 0.1], VIAL_GLASS, turn);
    glow.add(at(0, 0.99, -0.06), [0.08, 0.13, 0.08], BLOOD_POOL, turn);
    lit.add(at(0.042, 1.0, -0.02), [0.008, 0.12, 0.008], VIAL_GLASS, turn);
    lit.add(at(0, 1.07, -0.06), [0.1, 0.03, 0.1], VIAL_GLASS, turn);
    lit.add(at(0, 1.1, -0.06), [0.06, 0.04, 0.06], pick(rand, PLANK), turn);
  },

  digger: ({ lit, glow, rand, x, z, base }) => {
    const yaw = 0.5 + (rand() - 0.5) * 0.5;
    const at = turned(x, z, base, yaw);
    const turn = new Euler(0, yaw, 0);
    const b = (): string => pick(rand, BONE);
    for (const side of [-1, 1]) {
      lit.add(at(side * 0.07, 0.02, 0.03), [0.07, 0.04, 0.11], b(), turn);
      bone(lit, at(side * 0.07, 0.05, 0), at(side * 0.07, 0.22, 0.01), 0.035, b());
      bone(lit, at(side * 0.07, 0.24, 0.01), at(side * 0.08, 0.42, 0), 0.04, b());
    }
    lit.add(at(0, 0.45, 0), [0.22, 0.08, 0.12], b(), turn);
    lit.add(at(0, 0.6, -0.04), [0.04, 0.24, 0.04], b(), turn);
    for (let i = 0; i < 3; i++) {
      lit.add(at(0, 0.6 + i * 0.065, 0), [0.24 - Math.abs(i - 1) * 0.03, 0.03, 0.15], b(), turn);
    }
    lit.add(at(0, 0.66, 0.07), [0.03, 0.15, 0.02], b(), turn);
    lit.add(at(0, 0.78, -0.01), [0.3, 0.04, 0.05], b(), turn);
    lit.add(at(0, 0.82, -0.01), [0.035, 0.05, 0.035], b(), turn);
    skull(lit, at, turn, 0, 0.92, 0, 0.2, BONE[0], glow, DIGGER_EYE);
    const low = new Vector3(0, 0.74, 0.25);
    const high = new Vector3(0.16, 1.16, -0.05);
    const along = high.clone().sub(low).normalize();
    const grip = low.clone().addScaledVector(along, 0.06);
    const grip2 = low.clone().addScaledVector(along, 0.16);
    const v = (p: Vector3): Vec => at(p.x, p.y, p.z);
    stick(lit, v(low), v(high.clone().addScaledVector(along, 0.03)), 0.035, PLANK_DARK);
    const head = new Vector3(0, 0, 1).addScaledVector(along, -along.z).normalize();
    stick(lit, v(high.clone().addScaledVector(head, -0.2)), v(high.clone().addScaledVector(head, 0.22)), 0.045, PICK_HEAD);
    stick(lit, v(high.clone().addScaledVector(head, 0.2)), v(high.clone().addScaledVector(head, 0.27)), 0.025, PICK_HEAD);
    lit.add(v(high), [0.07, 0.07, 0.07], IRON, turn);
    for (const [shoulder, elbow, hand] of [
      [new Vector3(0.14, 0.78, 0), new Vector3(0.18, 0.66, 0.12), grip],
      [new Vector3(-0.14, 0.78, 0), new Vector3(-0.1, 0.68, 0.16), grip2],
    ]) {
      bone(lit, v(shoulder), v(elbow), 0.03, b());
      bone(lit, v(elbow), v(hand), 0.028, b());
    }
    for (let i = 0; i < 3; i++) {
      const s = 0.06 + rand() * 0.06;
      lit.add([x + (rand() - 0.5) * 0.7, base + s * 0.3, z + 0.25 + rand() * 0.15], [s, s * 0.6, s], pick(rand, rand() < 0.5 ? STONE : DIRT), new Euler(0, rand() * Math.PI, 0));
    }
  },

  'bone-wall': ({ lit, rand, map, tx, ty, x, z, base }) => {
    const joins = (dx: number, dy: number): boolean => WALLS.has(map.get(tx + dx, ty + dy));
    const alongZ = joins(0, 1) || joins(0, -1);
    const alongX = joins(1, 0) || joins(-1, 0) || !alongZ;
    for (const horizontal of [alongX, alongZ].flatMap((on: boolean, i: number): boolean[] => (on ? [i === 0] : []))) {
      const yaw = horizontal ? 0 : Math.PI / 2;
      const at = turned(x, z, base, yaw);
      const turn = new Euler(0, yaw, 0);
      lit.add(at(0, 0.06, 0), [1, 0.12, 0.46], pick(rand, STONE), turn);
      lit.add(at(0, 0.58, 0), [0.98, 0.92, 0.22], BONE_PACK, turn);
      for (let row = 0; row < 5; row++) {
        const y = 0.2 + row * 0.19;
        for (const dz of [-0.1, 0.1]) {
          let start = -0.5 + (row % 2 ? 0.12 : 0) - rand() * 0.08;
          while (start < 0.44) {
            const end = Math.min(0.48, start + 0.32 + rand() * 0.18);
            if (end - start > 0.12) {
              bone(lit, at(start + 0.05, y + (rand() - 0.5) * 0.03, dz), at(end - 0.05, y + (rand() - 0.5) * 0.03, dz), 0.075, pick(rand, BONE));
            }
            start = end + 0.02;
          }
        }
      }
      for (const row of [1, 3]) {
        skull(lit, at, turn, (rand() - 0.5) * 0.6, 0.2 + row * 0.19, 0.12, 0.2, pick(rand, BONE));
      }
      if (rand() < 0.6) {
        skull(lit, at, new Euler(0, yaw + (rand() - 0.5) * 0.6, 0), (rand() - 0.5) * 0.5, 1.15, 0, 0.18, pick(rand, BONE));
      }
    }
  },

  coffin: ({ lit, glow, rand, x, z, base }) => {
    const yaw = (rand() - 0.5) * 0.3;
    const at = turned(x, z, base, yaw);
    const turn = new Euler(0, yaw, 0);
    lit.add(at(0, 0.01, 0.02), [0.62, 0.02, 0.98], pick(rand, DIRT), turn);
    const width = (dz: number): number => (dz < -0.2 ? 0.3 + (dz + 0.44) / 0.24 * 0.22 : 0.52 - (dz + 0.2) / 0.64 * 0.24);
    for (let i = 0; i < 10; i++) {
      const dz = -0.44 + (i + 0.5) * 0.088;
      const w = width(dz);
      lit.add(at(0, 0.13, dz), [w, 0.22, 0.09], COFFIN_WOOD[0], turn);
      lit.add(at(0, 0.255, dz), [w - 0.07, 0.04, 0.09], COFFIN_WOOD[1], turn);
    }
    lit.add(at(0, 0.29, 0.03), [0.06, 0.03, 0.46], BONE[0], turn);
    lit.add(at(0, 0.29, -0.1), [0.26, 0.03, 0.06], BONE[0], turn);
    for (const dz of [-0.04, 0.22]) {
      for (const side of [-1, 1]) {
        lit.add(at(side * (width(dz) / 2 + 0.02), 0.13, dz), [0.03, 0.04, 0.12], IRON, turn);
      }
    }
    candle(lit, glow, at(-0.26, 0, -0.42), 0.12);
  },

  cauldron: ({ lit, glow, rand, x, z, base }) => {
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + rand() * 0.3;
      lit.add([x + Math.cos(a) * 0.38, base + 0.05, z + Math.sin(a) * 0.38], [0.15, 0.1, 0.15], i % 2 ? EMBER_STONE : pick(rand, STONE), new Euler(0, a, 0));
    }
    lit.add([x, base + 0.06, z], [0.46, 0.08, 0.08], pick(rand, PLANK), new Euler(0, Math.PI / 4, 0.15));
    lit.add([x, base + 0.06, z], [0.46, 0.08, 0.08], pick(rand, PLANK), new Euler(0, -Math.PI / 4, -0.15));
    for (let i = 0; i < 3; i++) {
      const a = Math.PI / 2 + (i / 3) * Math.PI * 2;
      stick(lit, [x + Math.cos(a) * 0.34, base, z + Math.sin(a) * 0.3], [x + Math.cos(a) * 0.24, base + 0.3, z + Math.sin(a) * 0.22], 0.04, FORGE_IRON);
    }
    for (const [y, w, h] of [[0.27, 0.36, 0.06], [0.34, 0.54, 0.08], [0.44, 0.66, 0.14], [0.56, 0.62, 0.12], [0.64, 0.56, 0.06]] as const) {
      lit.add([x, base + y, z], [w, h, w * 0.86], FORGE_IRON);
      lit.add([x, base + y, z], [w * 0.86, h, w], FORGE_IRON);
    }
    for (const side of [-1, 1]) {
      lit.add([x, base + 0.69, z + side * 0.28], [0.62, 0.05, 0.06], IRON);
      lit.add([x + side * 0.28, base + 0.69, z], [0.06, 0.05, 0.62], IRON);
    }
    glow.add([x, base + 0.69, z], [0.5, 0.03, 0.5], BREW[0]);
    for (let i = 0; i < 4; i++) {
      const s = 0.04 + rand() * 0.05;
      glow.add([x + (rand() - 0.5) * 0.36, base + 0.7 + s * 0.3, z + (rand() - 0.5) * 0.36], [s, s * 0.7, s], pick(rand, BREW));
    }
    for (let i = 0; i < 3; i++) {
      const dx = (i - 1) * 0.16 + (rand() - 0.5) * 0.06;
      glow.add([x + dx, base + 0.6, z + 0.3], [0.04, 0.12 + rand() * 0.1, 0.01], BREW[2]);
    }
    skull(lit, turned(x, z, base, 0), new Euler(0.3, 0.6, 0), -0.12, 0.71, 0.05, 0.13, BONE[0]);
    stick(lit, [x + 0.08, base + 0.66, z - 0.05], [x + 0.3, base + 1.02, z - 0.22], 0.035, BONE[1]);
    lit.add([x + 0.31, base + 1.04, z - 0.23], [0.06, 0.05, 0.06], BONE[2]);
    for (const side of [-1, 1]) {
      lit.add([x + side * 0.34, base + 0.56, z], [0.04, 0.1, 0.04], IRON);
    }
    for (const [vx, vz] of [[0.42, 0.36], [0.33, 0.43]]) {
      lit.add([x + vx, base + 0.07, z + vz], [0.07, 0.1, 0.07], VIAL_GLASS);
      glow.add([x + vx, base + 0.055, z + vz], [0.055, 0.07, 0.055], BREW[1]);
      lit.add([x + vx, base + 0.14, z + vz], [0.035, 0.04, 0.035], pick(rand, PLANK));
    }
  },

  bell: ({ lit, glow, rand, x, z, base }) => {
    for (const side of [-1, 1]) {
      lit.add([x + side * 0.38, base + 0.04, z], [0.22, 0.08, 0.22], pick(rand, STONE));
      lit.add([x + side * 0.38, base + 0.7, z], [0.1, 1.36, 0.1], PLANK_DARK);
      stick(lit, [x + side * 0.38, base + 1.08, z], [x + side * 0.18, base + 1.34, z], 0.05, PLANK_DARK);
    }
    lit.add([x, base + 1.38, z], [0.96, 0.1, 0.12], pick(rand, PLANK));
    lit.add([x, base + 1.28, z], [0.02, 0.1, 0.02], IRON);
    lit.add([x, base + 1.24, z], [0.16, 0.04, 0.08], IRON);
    for (const [y, w, h, color] of [[1.2, 0.12, 0.05, SILVER[1]], [1.13, 0.2, 0.1, SILVER[0]], [1.04, 0.24, 0.1, SILVER[0]], [0.96, 0.3, 0.08, SILVER[0]], [0.9, 0.38, 0.06, SILVER[1]]] as const) {
      lit.add([x, base + y, z], [w, h, w * 0.7], color);
      lit.add([x, base + y, z], [w * 0.7, h, w], color);
    }
    lit.add([x, base + 0.865, z], [0.34, 0.01, 0.34], SOCKET);
    lit.add([x, base + 0.84, z], [0.07, 0.07, 0.07], IRON);
    glow.add([x - 0.06, base + 1.06, z + 0.136], [0.03, 0.12, 0.01], BELL_GLEAM);
    glow.add([x - 0.1, base + 0.92, z + 0.2], [0.05, 0.03, 0.01], BELL_GLEAM);
  },
};

function deadTree({ lit, rand, x, z, base }: Paint): void {
  lit.add([x, base + 0.9, z], [0.3, 1.8, 0.3], BARK);
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + rand();
    const tiltUp = 0.4 + rand() * 0.5;
    const len = 0.5 + rand() * 0.4;
    const baseY = base + 1.0 + rand() * 0.7;
    const dirX = Math.cos(angle);
    const dirZ = -Math.sin(angle);
    const reach = Math.cos(tiltUp) * len / 2;
    lit.add(
      [x + dirX * reach, baseY + Math.sin(tiltUp) * len / 2, z + dirZ * reach],
      [len, 0.1, 0.1],
      BARK,
      new Euler(0, angle, tiltUp, 'YXZ'),
    );
  }
}

function pineTree({ lit, rand, x, z, base }: Paint): void {
  lit.add([x, base + 0.25, z], [0.2, 0.5, 0.2], BARK);
  const tiers = [0.95, 0.78, 0.6, 0.4, 0.2];
  tiers.forEach((w: number, i: number): void => {
    lit.add([x, base + 0.55 + i * 0.32, z], [w, 0.34, w], pick(rand, PINE), new Euler(0, rand() * 0.6, 0));
  });
}

function twistedTree({ lit, rand, x, z, base }: Paint): void {
  let cx = x;
  let cz = z;
  for (let i = 0; i < 4; i++) {
    lit.add([cx, base + 0.25 + i * 0.4, cz], [0.26, 0.45, 0.26], BARK, new Euler((rand() - 0.5) * 0.4, 0, (rand() - 0.5) * 0.4));
    cx += (rand() - 0.5) * 0.18;
    cz += (rand() - 0.5) * 0.18;
  }
  for (let i = 0; i < 4; i++) {
    lit.add([cx + (rand() - 0.5) * 0.7, base + 1.55 + rand() * 0.4, cz + (rand() - 0.5) * 0.7], [0.45, 0.35, 0.45], pick(rand, LEAVES), new Euler(0, rand(), 0));
  }
}
