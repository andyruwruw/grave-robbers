// Packages
import { Euler } from 'three';

// Local Imports
import { pick } from '../../../helpers/pick';
import { IRON_SPIKE, PLANK, PLANK_DARK, ROPE, STAKE_TIP } from '../../config/palette/structures';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * A bolt turret: a crossbow on a wooden tripod.
 */
export class BoltTurretPainter extends TilePainter {
  /**
   * Paints the bolt turret.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, rand, x, z, base } = p;
    const yaw = (rand() - 0.5) * 0.6;
    const at = this.turned(x, z, base, yaw);
    const turn = new Euler(0, yaw, 0);
    for (const a of [0.4, 2.5, 4.6]) {
      this.stick(lit, at(Math.cos(a) * 0.32, 0, Math.sin(a) * 0.32), at(0, 0.5, 0), 0.05, pick(rand, PLANK));
    }
    lit.add(at(0, 0.53, 0), [0.22, 0.08, 0.22], PLANK_DARK, turn);
    lit.add(at(0, 0.62, 0.02), [0.1, 0.08, 0.5], pick(rand, PLANK), turn);
    lit.add(at(0, 0.66, 0.24), [0.62, 0.05, 0.06], PLANK_DARK, new Euler(0, yaw, 0));
    for (const side of [-1, 1]) {
      lit.add(at(side * 0.28, 0.66, 0.2), [0.08, 0.04, 0.06], PLANK_DARK, new Euler(0, yaw + side * 0.35, 0));
    }
    lit.add(at(0, 0.67, 0.06), [0.6, 0.012, 0.012], ROPE, turn);
    lit.add(at(0, 0.7, 0.12), [0.025, 0.025, 0.42], STAKE_TIP, turn);
    lit.add(at(0, 0.7, 0.34), [0.04, 0.04, 0.06], IRON_SPIKE, turn);
  }
}
