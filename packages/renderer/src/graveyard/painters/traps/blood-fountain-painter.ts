// Local Imports
import { pick } from '../../../helpers/pick';
import { BLOOD_POOL } from '../../config/palette/props';
import { ALTAR_STONE } from '../../config/palette/structures';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * A stone fountain with basins of blood.
 */
export class BloodFountainPainter extends TilePainter {
  /**
   * Paints the blood fountain.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, glow, rand, x, z, base } = p;
    lit.add([x, base + 0.05, z], [0.8, 0.1, 0.8], pick(rand, ALTAR_STONE));
    lit.add([x, base + 0.3, z], [0.3, 0.45, 0.3], pick(rand, ALTAR_STONE));
    lit.add([x, base + 0.58, z], [0.86, 0.12, 0.86], pick(rand, ALTAR_STONE));
    for (const [dx, dz, w, d] of [[0.39, 0, 0.08, 0.86], [-0.39, 0, 0.08, 0.86], [0, 0.39, 0.86, 0.08], [0, -0.39, 0.86, 0.08]]) {
      lit.add([x + dx, base + 0.7, z + dz], [w, 0.12, d], pick(rand, ALTAR_STONE));
    }
    lit.add([x, base + 0.66, z], [0.7, 0.02, 0.7], BLOOD_POOL);
    lit.add([x, base + 0.85, z], [0.1, 0.4, 0.1], pick(rand, ALTAR_STONE));
    lit.add([x, base + 1.06, z], [0.3, 0.06, 0.3], pick(rand, ALTAR_STONE));
    lit.add([x, base + 1.1, z], [0.24, 0.02, 0.24], BLOOD_POOL);
    glow.add([x, base + 0.675, z], [0.3, 0.005, 0.3], '#c8141f');
    glow.add([x + 0.13, base + 0.9, z], [0.03, 0.18, 0.03], '#c8141f');
  }
}
