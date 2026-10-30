// Packages
import { Group } from 'three';
import { seededRandom } from '@halloween/shared/helpers/seeded-random';

// Local Imports
import { toWorld } from '../space/world-coords';
import { GRASS } from './config/palette/ground';
import { grassDecor, quad } from './ground/ground-painter';
import { PAINTERS } from './painters/painter-registry';
import { VoxelBatch } from './voxel-batch';

// Types
import type { WorldMap } from '@halloween/shared/world/world-map';
import type { Paint } from '../types/terrain';

/**
 * Scenery beyond the fence, `spanX` tiles out to the sides and `spanY` out
 * the top and bottom, so the TV fills edge to edge whatever its shape. Dense
 * woods with a few rocks; the band just south of the fence stays low so
 * nothing hides the bottom of the playable map.
 * @param map The map.
 * @param seed The world seed.
 * @param spanX Tiles out to each side.
 * @param spanY Tiles out the top and bottom.
 * @returns The scenery's group.
 */
export function buildOutskirts(map: WorldMap, seed: number, spanX: number, spanY: number): Group {
  const lit = new VoxelBatch();
  const glow = new VoxelBatch();
  for (let ty = -spanY; ty < map.height + spanY; ty++) {
    for (let tx = -spanX; tx < map.width + spanX; tx++) {
      if (tx >= 0 && ty >= 0 && tx < map.width && ty < map.height) {
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
      if (ty >= map.height && ty < map.height + 2) {
        grassDecor(p);
      } else if (roll < 0.6) {
        PAINTERS.tree!.paint(p);
      } else if (roll < 0.66) {
        PAINTERS.rock!.paint(p);
      } else {
        grassDecor(p);
      }
    }
  }
  const group = new Group();
  group.add(lit.build(), glow.build(true));
  return group;
}
