// Packages
import { Group } from 'three';
import { seededRandom } from '@halloween/shared/helpers/seeded-random';
import { LEVEL_HEIGHT, MAP_WIDTH } from '@halloween/shared/world/dimensions';

// Local Imports
import { pick } from '../helpers/pick';
import { HEDGE } from './config/palette/ground';
import { VoxelBatch } from './voxel-batch';

// Types
import type { WorldMap } from '@halloween/shared/world/world-map';

/**
 * Whether undergrowth fills the gap between a tree and its neighbor
 * (dx, dy): both are trees on the same level. It shows where walking
 * between them slows you down.
 * @param map The map.
 * @param tx Tile column.
 * @param ty Tile row.
 * @param dx Step east to the neighbor.
 * @param dy Step south to the neighbor.
 * @returns True when a shrub fills the gap.
 */
export function shrubBetween(map: WorldMap, tx: number, ty: number, dx: number, dy: number): boolean {
  return map.get(tx, ty) === 'tree' && map.get(tx + dx, ty + dy) === 'tree' && map.level(tx, ty) === map.level(tx + dx, ty + dy);
}

/**
 * Low bushes filling the gap between two trees side by side, centered on
 * their shared edge at (x, z), running along x or z. Seeded by the edge, so
 * it's the same every rebuild.
 * @param lit Where the bushes go.
 * @param seed The world seed.
 * @param tx Column of the west or north tree.
 * @param ty Row of the west or north tree.
 * @param alongX Whether the trees are side by side east and west.
 * @param x World-space x of the shared edge.
 * @param z World-space z of the shared edge.
 * @param base Height of the ground.
 */
export function paintShrub(lit: VoxelBatch, seed: number, tx: number, ty: number, alongX: boolean, x: number, z: number, base: number): void {
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
 * @param map The map.
 * @param seed The world seed.
 * @param tx Column of the west or north tree.
 * @param ty Row of the west or north tree.
 * @param dx 1 when the neighbor is east.
 * @param dy 1 when the neighbor is south.
 * @returns The shrub's group.
 */
export function buildShrub(map: WorldMap, seed: number, tx: number, ty: number, dx: number, dy: number): Group {
  const lit = new VoxelBatch();
  paintShrub(lit, seed, tx, ty, dx === 1, 0, 0, map.level(tx, ty) * LEVEL_HEIGHT);
  const group = new Group();
  group.add(lit.build());
  return group;
}
