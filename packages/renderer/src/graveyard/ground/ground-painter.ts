// Packages
import { Euler } from 'three';

// Local Imports
import { pick } from '../../helpers/pick';
import {
  COBBLE,
  DEAD_GRASS,
  DIRT,
  FLAG,
  GRASS,
  GROUT,
  LEAVES,
  MOSS,
  MUSHROOM_CAP,
  MUSHROOM_STEM,
  PEBBLE,
  PIT,
  STONE,
} from '../config/palette/ground';
import { GRASS_BY_LEVEL, GROUND } from '../config/terrain-shape';
import { paintStairs } from './stairs-painter';
import { paintTerrain } from './terrain-walls';

// Types
import type { Tile } from '@halloween/shared/world/tiles';
import type { Batch, Paint } from '../../types/terrain';

/**
 * Lifts boxes painted as if at ground level onto a tile's terrain.
 * @param batch Where the boxes really go.
 * @param by How far to lift them.
 * @returns A batch that adds lifted boxes to `batch`.
 */
function lifted(batch: Batch, by: number): Batch {
  return { add: (pos, size, color, rot): void => batch.add([pos[0], pos[1] + by, pos[2]], size, color, rot) };
}

/**
 * A tile's ground: the terrain bank under it, then its floor (stairs,
 * dirt, a dug grave, cobbles, flagstones, or grass with decoration).
 * @param p The tile being painted.
 * @param floor The floor to paint.
 */
export function paintGround(p: Paint, floor: Tile): void {
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
 * @param p The tile being painted.
 * @param top Height of the patch's top.
 * @param palette Its colors.
 * @param jitter Most a sub-voxel's height varies.
 */
export function quad(p: Paint, top: number, palette: string[], jitter: number): void {
  for (let sy = 0; sy < 2; sy++) {
    for (let sx = 0; sx < 2; sx++) {
      const h = 0.5 + p.rand() * jitter;
      p.lit.add([p.x - 0.25 + sx * 0.5, top + h / 2 - 0.5, p.z - 0.25 + sy * 0.5], [0.5, h, 0.5], pick(p.rand, palette));
    }
  }
}

/**
 * Tufts, moss, fallen leaves, and the odd mushroom cluster.
 * @param p The tile being painted.
 */
export function grassDecor(p: Paint): void {
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
