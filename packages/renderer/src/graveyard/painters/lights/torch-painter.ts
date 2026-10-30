// Local Imports
import { pick } from '../../../helpers/pick';
import { STONE } from '../../config/palette/ground';
import { PLANK, PLANK_DARK } from '../../config/palette/structures';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * A standing torch on a stone (its flame is animated by `Flames`).
 */
export class TorchPainter extends TilePainter {
  /**
   * Paints the torch.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, rand, x, z, base } = p;
    lit.add([x, base + 0.45, z], [0.12, 0.9, 0.12], PLANK_DARK);
    lit.add([x, base + 0.95, z], [0.2, 0.12, 0.2], pick(rand, PLANK));
    lit.add([x, base + 0.04, z], [0.3, 0.08, 0.3], pick(rand, STONE));
  }
}
