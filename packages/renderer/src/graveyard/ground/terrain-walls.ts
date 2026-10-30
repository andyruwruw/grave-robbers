// Packages
import { Euler } from 'three';
import { LEVEL_HEIGHT } from '@halloween/shared/world/dimensions';

// Local Imports
import { pick } from '../../helpers/pick';
import { MOSS } from '../config/palette/ground';
import { FOOT, LIP, MORTAR, WALL_STONE } from '../config/palette/tower';
import { SIDES, WALL_COURSE } from '../config/terrain-shape';
import { groundHeight, ledTo } from '../helpers/tile-queries';

// Types
import type { Paint } from '../../types/terrain';

/**
 * A stone bank under a raised tile, down to its lowest neighbor, with a
 * pale stone lip along each edge that drops away (so terraces read in the
 * dark) and a few stones jutting from the face below.
 * @param p The tile being painted.
 */
export function paintTerrain(p: Paint): void {
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
      lowest = Math.min(lowest, groundHeight(map, tx + dx, ty + dy));
    }
  }
  if (lowest >= base) {
    return;
  }
  const bottom = lowest - 0.5;
  const top = base - 0.3;
  lit.add([x, (bottom + top) / 2, z], [1, top - bottom, 1], MORTAR);
  for (const [dx, dy] of SIDES) {
    const below = groundHeight(map, tx + dx, ty + dy);
    if (below < base && !ledTo(map, tx + dx, ty + dy, -dx, -dy)) {
      retainingWall(p, dx, dy, below, base);
    }
  }
}

/**
 * Rough coursed stone down the side of a raised tile that drops toward
 * (dx, dy): stones of uneven length and depth, the odd one missing, a
 * broken rim of capstones at different heights along the top, and rubble
 * at the foot.
 * @param p The tile being painted.
 * @param dx Step east toward the drop.
 * @param dy Step south toward the drop.
 * @param below Height of the ground below.
 * @param base Height of the tile's own ground.
 */
function retainingWall(p: Paint, dx: number, dy: number, below: number, base: number): void {
  const { lit, rand, x, z } = p;
  /**
   * Places a point along and out from the wall's edge.
   * @param along Offset along the edge.
   * @param out Offset out from the edge.
   * @param y Height.
   * @returns The world position.
   */
  const at = (along: number, out: number, y: number): [number, number, number] =>
    [x + dx * out + (dy !== 0 ? along : 0), y, z + dy * out + (dx !== 0 ? along : 0)];
  /**
   * Turns a stone's length and depth to face the wall's side.
   * @param length Size along the edge.
   * @param height Size up.
   * @param depth Size out from the edge.
   * @returns The box size.
   */
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
