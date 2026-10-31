// Packages
import { Euler } from 'three';

// Local Imports
import { pick } from '../../../helpers/pick';
import {
  BELT_ARROW,
  BELT_RUBBER,
  BRASS,
  SORTER_EYE,
} from '../../config/palette/props';
import { IRON, PLANK, PLANK_DARK } from '../../config/palette/structures';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * A belt sorter: a square of belt rubber framed in planks, chevrons on the
 * way it carries, iron chute lips on the other three sides, and a short
 * gate post in the middle with a hinged paddle and a glowing eye.
 */
export class SorterPainter extends TilePainter {
  /**
   * Paints the sorter.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, glow, rand, map, tx, ty, x, z, base } = p;
    const [dx, dy] = map.turnOf(tx, ty) ?? [1, 0];
    const yaw = Math.atan2(dx, dy);
    const at = this.turned(x, z, base, yaw);
    const turn = new Euler(0, yaw, 0);
    lit.add(at(0, 0.1, 0), [0.84, 0.04, 0.84], BELT_RUBBER, turn);
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        lit.add(at(sx * 0.42, 0.07, sz * 0.42), [0.14, 0.14, 0.14], pick(rand, PLANK), turn);
      }
    }
    for (const [lx, lz, wide] of [[-0.45, 0, false], [0.45, 0, false], [0, -0.45, true]] as [number, number, boolean][]) {
      lit.add(at(lx, 0.06, lz), wide ? [0.62, 0.05, 0.06] : [0.06, 0.05, 0.62], IRON, turn);
      lit.add(at(lx * 0.93, 0.115, lz * 0.93), wide ? [0.5, 0.012, 0.03] : [0.03, 0.012, 0.5], BRASS, turn);
    }
    for (const step of [0.24, 0.4]) {
      lit.add(at(-0.07, 0.125, step - 0.05), [0.18, 0.01, 0.05], BELT_ARROW, new Euler(0, yaw - 0.8, 0));
      lit.add(at(0.07, 0.125, step - 0.05), [0.18, 0.01, 0.05], BELT_ARROW, new Euler(0, yaw + 0.8, 0));
    }
    lit.add(at(0, 0.13, -0.08), [0.1, 0.03, 0.1], IRON, turn);
    lit.add(at(0, 0.21, -0.08), [0.05, 0.16, 0.05], PLANK_DARK, turn);
    lit.add(at(0.105, 0.2, -0.16), [0.26, 0.1, 0.025], pick(rand, PLANK), new Euler(0, yaw + 0.65, 0));
    lit.add(at(0, 0.24, -0.08), [0.06, 0.02, 0.06], BRASS, turn);
    lit.add(at(0, 0.31, -0.08), [0.08, 0.05, 0.08], IRON, turn);
    glow.add(at(0, 0.34, -0.08), [0.05, 0.012, 0.05], SORTER_EYE, turn);
  }
}
