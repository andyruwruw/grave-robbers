// Local Imports
import { pick } from '../../../helpers/pick';
import { STONE } from '../../config/palette/ground';
import { IRON, PLANK_DARK } from '../../config/palette/structures';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * A lantern post with an iron cage (its flame is animated by `Flames`).
 */
export class LanternPainter extends TilePainter {
  /**
   * Paints the lantern.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, rand, x, z, base } = p;
    lit.add([x, base + 0.04, z], [0.3, 0.08, 0.3], pick(rand, STONE));
    lit.add([x, base + 0.6, z], [0.12, 1.2, 0.12], PLANK_DARK);
    lit.add([x, base + 1.22, z], [0.3, 0.05, 0.3], IRON);
    lit.add([x, base + 1.5, z], [0.3, 0.05, 0.3], IRON);
    for (const [dx, dz] of [[-0.13, -0.13], [0.13, -0.13], [-0.13, 0.13], [0.13, 0.13]]) {
      lit.add([x + dx, base + 1.36, z + dz], [0.03, 0.28, 0.03], IRON);
    }
  }
}
