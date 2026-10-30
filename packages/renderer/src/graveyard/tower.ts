// Packages
import { Euler, Group } from 'three';
import { seededRandom } from '@halloween/shared/helpers/seeded-random';
import { LEVEL_HEIGHT } from '@halloween/shared/world/dimensions';

// Local Imports
import { pick } from '../helpers/pick';
import { toWorld } from '../space/world-coords';
import { MOSS } from './config/palette/ground';
import { TOWER_STONE } from './config/palette/tower';
import { TOWER_COURSE, TOWER_CRUMBLE, TOWER_PILLAR, TOWER_WALL } from './config/terrain-shape';
import { VoxelBatch } from './voxel-batch';

// Types
import type { WorldMap } from '@halloween/shared/world/world-map';

/**
 * The watchtower above its lowest course, a roofless ruin: every wall
 * column crumbles to its own height (the front lower than the back), with
 * gaps and loose stones on top, and the pillar is a broken stump. Split so
 * the side facing the camera can be cut away while someone is inside:
 * `back` is the north half of the walls, `front` the middle row (with the
 * pillar) and the south half.
 * @param map The map.
 * @param seed The world seed.
 * @returns The two halves and the tower's tile rectangle, or null when the
 * map has no tower.
 */
export function buildTower(map: WorldMap, seed: number): { back: Group; front: Group; x: number; y: number; w: number; h: number } | null {
  let x0 = map.width;
  let y0 = map.height;
  let x1 = -1;
  let y1 = -1;
  for (let ty = 0; ty < map.height; ty++) {
    for (let tx = 0; tx < map.width; tx++) {
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
  /**
   * Wraps a batch's built mesh in a group.
   * @param batch The batch.
   * @returns The group.
   */
  const group = (batch: VoxelBatch): Group => {
    const g = new Group();
    g.add(batch.build());
    return g;
  };
  return { back: group(back), front: group(front), x: x0, y: y0, w: span, h: y1 - y0 + 1 };
}
