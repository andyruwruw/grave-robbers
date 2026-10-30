// Packages
import { Group } from 'three';
import { seededRandom } from '@halloween/shared/helpers/seeded-random';
import { LEVEL_HEIGHT } from '@halloween/shared/world/dimensions';

// Local Imports
import { toWorld } from '../space/world-coords';
import { CHASM_FLOOR } from './config/palette/ground';
import { CHASM_DEPTH, GROUND } from './config/terrain-shape';
import { paintGround } from './ground/ground-painter';
import { floorUnder } from './helpers/tile-queries';
import { PAINTERS } from './painters/painter-registry';
import { paintShrub, shrubBetween } from './shrubs';
import { VoxelBatch } from './voxel-batch';

// Types
import type {
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
} from 'three';
import type { WorldMap } from '@halloween/shared/world/world-map';
import type { ChunkRegion, Paint, StaticLight } from '../types/terrain';

/**
 * Builds every static voxel in the graveyard, including player structures
 * (flames are animated separately). Trees go in a mesh of their own, each
 * box tagged with its tree's base, so `TreeSway` can shake them. Decoration
 * is seeded per tile, so rebuilding after a tile change only alters that
 * tile. Tiles in `bare` (by index) get only their ground, for something
 * drawn on its own while it grows in. `region` builds just that rectangle
 * of tiles (a chunk); the whole map without it.
 * @param map The map.
 * @param seed The world seed.
 * @param bare Indexes of tiles to paint only the ground of.
 * @param region The rectangle of tiles to build.
 * @returns The world group and every permanent light (pumpkins, lamps,
 * candles, and a faint glow on chests so they can be found).
 */
export function buildGraveyard(map: WorldMap, seed: number, bare: ReadonlySet<number> = new Set(), region: ChunkRegion = { x: 0, y: 0, w: map.width, h: map.height }): { group: Group; lights: StaticLight[] } {
  const lit = new VoxelBatch();
  const glow = new VoxelBatch();
  const trees = new VoxelBatch();
  const lights: StaticLight[] = [];

  for (let ty = region.y; ty < region.y + region.h; ty++) {
    for (let tx = region.x; tx < region.x + region.w; tx++) {
      const tile = map.get(tx, ty);
      const { x, z } = toWorld(tx + 0.5, ty + 0.5);
      if (tile === 'chasm') {
        lit.add([x, CHASM_DEPTH, z], [1, 0.1, 1], CHASM_FLOOR);
        continue;
      }
      const floor = GROUND.has(tile) ? tile : floorUnder(map, tx, ty);
      const p = tilePaint(map, seed, tx, ty, lit, glow, x, z);
      paintGround(p, floor);
      if (bare.has(ty * map.width + tx)) {
        continue;
      }
      if (tile === 'tree') {
        trees.anchor = [x, p.base, z];
        PAINTERS.tree!.paint({ ...p, lit: trees });
        continue;
      }
      const painter = PAINTERS[tile];
      painter?.paint(p);
      painter?.staticLights(p, lights);
    }
  }

  for (let ty = region.y; ty < region.y + region.h; ty++) {
    for (let tx = region.x; tx < region.x + region.w; tx++) {
      for (const [dx, dy] of [[1, 0], [0, 1]] as const) {
        if (shrubBetween(map, tx, ty, dx, dy) && !bare.has(ty * map.width + tx) && !bare.has((ty + dy) * map.width + tx + dx)) {
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
 * Just the contents of one tile (no ground), centered on the origin, looking
 * exactly as it does in the full build.
 * @param map The map.
 * @param seed The world seed.
 * @param tx Tile column.
 * @param ty Tile row.
 * @returns The tile's group.
 */
export function buildTile(map: WorldMap, seed: number, tx: number, ty: number): Group {
  const lit = new VoxelBatch();
  const glow = new VoxelBatch();
  PAINTERS[map.get(tx, ty)]?.paint(tilePaint(map, seed, tx, ty, lit, glow, 0, 0));
  const group = new Group();
  group.add(lit.build(), glow.build(true));
  return group;
}

/**
 * The contents of one tile as loose boxes in world space (big boxes cut
 * into chunks no longer than `chunk`), for breaking it apart.
 * @param map The map.
 * @param seed The world seed.
 * @param tx Tile column.
 * @param ty Tile row.
 * @param material The material for a color, lit or glowing.
 * @param chunk Longest a piece may be along an axis, in world units.
 * @returns The loose pieces.
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
  PAINTERS[map.get(tx, ty)]?.paint(tilePaint(map, seed, tx, ty, lit, glow, x, z));
  return [
    ...lit.pieces((color: string) => material(color, false), chunk),
    ...glow.pieces((color: string) => material(color, true), chunk),
  ];
}

/**
 * The painter inputs for a tile, with its per-tile PRNG.
 * @param map The map.
 * @param seed The world seed.
 * @param tx Tile column.
 * @param ty Tile row.
 * @param lit Where lit boxes go.
 * @param glow Where glowing boxes go.
 * @param x World-space x of the tile's center.
 * @param z World-space z of the tile's center.
 * @returns The painter inputs.
 */
function tilePaint(map: WorldMap, seed: number, tx: number, ty: number, lit: VoxelBatch, glow: VoxelBatch, x: number, z: number): Paint {
  return {
    lit,
    glow,
    rand: seededRandom(seed ^ Math.imul(ty * map.width + tx + 1, 2654435761)),
    map,
    tx,
    ty,
    x,
    z,
    base: map.level(tx, ty) * LEVEL_HEIGHT,
  };
}
