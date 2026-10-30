// Packages
import { Euler } from 'three';

// Local Imports
import { pick } from '../../../helpers/pick';
import { FLETCH_RED } from '../../config/palette/props';
import {
  IRON,
  IRON_SPIKE,
  PLANK,
  PLANK_DARK,
  ROPE,
  STAKE_TIP,
} from '../../config/palette/structures';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * A ballista: a big crossbow on a wooden frame with a loaded bolt.
 */
export class BallistaPainter extends TilePainter {
  /**
   * Paints the ballista.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, rand, x, z, base } = p;
    const yaw = (rand() - 0.5) * 0.4;
    const at = this.turned(x, z, base, yaw);
    const turn = new Euler(0, yaw, 0);
    for (const side of [-1, 1]) {
      lit.add(at(side * 0.28, 0.12, 0), [0.08, 0.24, 0.24], PLANK_DARK, turn);
      lit.add(at(side * 0.28, 0.12, 0), [0.1, 0.06, 0.06], IRON, turn);
    }
    lit.add(at(0, 0.18, 0), [0.6, 0.08, 0.1], pick(rand, PLANK), turn);
    this.stick(lit, at(0, 0.18, -0.25), at(0, 0.62, 0.05), 0.07, pick(rand, PLANK));
    lit.add(at(0, 0.62, 0), [0.14, 0.08, 0.86], pick(rand, PLANK), turn);
    lit.add(at(0, 0.66, 0), [0.06, 0.02, 0.84], PLANK_DARK, turn);
    for (const side of [-1, 1]) {
      lit.add(at(side * 0.26, 0.64, 0.34), [0.42, 0.07, 0.08], pick(rand, PLANK), new Euler(0, yaw - side * 0.35, 0));
      lit.add(at(side * 0.46, 0.64, 0.22), [0.06, 0.08, 0.06], IRON, turn);
      this.stick(lit, at(side * 0.46, 0.65, 0.22), at(0, 0.66, -0.18), 0.015, ROPE);
    }
    lit.add(at(0, 0.71, 0.08), [0.04, 0.04, 0.84], STAKE_TIP, turn);
    lit.add(at(0, 0.71, 0.52), [0.08, 0.06, 0.1], IRON_SPIKE, turn);
    lit.add(at(0, 0.71, -0.32), [0.12, 0.03, 0.08], FLETCH_RED, turn);
    for (const side of [-1, 1]) {
      lit.add(at(side * 0.1, 0.62, -0.36), [0.06, 0.14, 0.06], IRON, turn);
    }
  }
}
