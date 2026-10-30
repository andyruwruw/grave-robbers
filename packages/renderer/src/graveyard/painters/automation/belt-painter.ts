// Packages
import { Euler } from 'three';

// Local Imports
import { pick } from '../../../helpers/pick';
import { BELT_ARROW, BELT_RUBBER } from '../../config/palette/props';
import { IRON, PLANK } from '../../config/palette/structures';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * A conveyor belt, turned the way it carries, with arrows on the rubber.
 */
export class BeltPainter extends TilePainter {
  /**
   * Paints the belt.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, rand, map, tx, ty, x, z, base } = p;
    const [dx, dy] = map.turnOf(tx, ty) ?? [1, 0];
    const yaw = Math.atan2(dx, dy);
    const at = this.turned(x, z, base, yaw);
    const turn = new Euler(0, yaw, 0);
    for (const side of [-1, 1]) {
      lit.add(at(side * 0.42, 0.08, 0), [0.1, 0.16, 1], pick(rand, PLANK), turn);
      for (const end of [-0.4, 0, 0.4]) {
        lit.add(at(side * 0.42, 0.04, end), [0.12, 0.08, 0.08], IRON, turn);
      }
    }
    lit.add(at(0, 0.1, 0), [0.74, 0.04, 1], BELT_RUBBER, turn);
    for (const step of [-0.3, 0.05, 0.4]) {
      lit.add(at(-0.08, 0.125, step - 0.06), [0.2, 0.01, 0.05], BELT_ARROW, new Euler(0, yaw - 0.8, 0));
      lit.add(at(0.08, 0.125, step - 0.06), [0.2, 0.01, 0.05], BELT_ARROW, new Euler(0, yaw + 0.8, 0));
    }
  }
}
