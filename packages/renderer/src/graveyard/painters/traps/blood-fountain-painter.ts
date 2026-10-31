// Local Imports
import { pick } from '../../../helpers/pick';
import { ALTAR_TROUGH } from '../../config/palette/props';
import { ALTAR_STONE } from '../../config/palette/structures';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * A stone fountain whose basins stand dry and dark: the blood and the
 * victim's floating head are drawn over them by `FountainVictims` while it
 * holds a monster.
 */
export class BloodFountainPainter extends TilePainter {
  /**
   * Paints the blood fountain.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, rand, x, z, base } = p;
    lit.add([x, base + 0.05, z], [0.8, 0.1, 0.8], pick(rand, ALTAR_STONE));
    lit.add([x, base + 0.3, z], [0.3, 0.45, 0.3], pick(rand, ALTAR_STONE));
    lit.add([x, base + 0.58, z], [0.86, 0.12, 0.86], pick(rand, ALTAR_STONE));
    for (const [dx, dz, w, d] of [[0.39, 0, 0.08, 0.86], [-0.39, 0, 0.08, 0.86], [0, 0.39, 0.86, 0.08], [0, -0.39, 0.86, 0.08]]) {
      lit.add([x + dx, base + 0.7, z + dz], [w, 0.12, d], pick(rand, ALTAR_STONE));
    }
    lit.add([x, base + 0.645, z], [0.7, 0.01, 0.7], ALTAR_TROUGH);
    lit.add([x, base + 0.85, z], [0.1, 0.4, 0.1], pick(rand, ALTAR_STONE));
    lit.add([x, base + 1.06, z], [0.3, 0.06, 0.3], pick(rand, ALTAR_STONE));
    lit.add([x, base + 1.095, z], [0.24, 0.01, 0.24], ALTAR_TROUGH);
  }
}
