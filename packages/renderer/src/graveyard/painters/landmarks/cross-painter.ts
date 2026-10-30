// Local Imports
import { pick } from '../../../helpers/pick';
import { DIRT, STONE } from '../../config/palette/ground';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * A stone grave cross over its plot.
 */
export class CrossPainter extends TilePainter {
  /**
   * Paints the cross.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, rand, x, z, base } = p;
    const stone = pick(rand, STONE);
    lit.add([x, base + 0.45, z - 0.15], [0.12, 0.9, 0.12], stone);
    lit.add([x, base + 0.62, z - 0.15], [0.5, 0.12, 0.12], stone);
    lit.add([x, base + 0.05, z + 0.2], [0.5, 0.1, 0.7], pick(rand, DIRT));
  }
}
