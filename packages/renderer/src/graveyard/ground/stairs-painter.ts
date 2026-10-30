// Packages
import { LEVEL_HEIGHT } from '@halloween/shared/world/dimensions';

// Local Imports
import { pick } from '../../helpers/pick';
import { COBBLE } from '../config/palette/ground';
import { TREAD, WALL_STONE } from '../config/palette/tower';

// Types
import type { Paint } from '../../types/terrain';

/**
 * Four steps rising from a ramp tile's level to the higher tile it leads
 * to, in `palette`, on a slab of `under`.
 * @param p The tile being painted.
 * @param palette The steps' colors.
 * @param under The slab's colors.
 */
export function paintSteps(p: Paint, palette: string[], under: string[]): void {
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
 * @param p The tile being painted.
 */
export function paintStairs(p: Paint): void {
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
