// Local Imports
import { BARK, STUMP_RING } from '../../config/palette/ground';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * A cut tree stump with a root.
 */
export class StumpPainter extends TilePainter {
  /**
   * Paints the stump.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, x, z, base } = p;
    lit.add([x, base + 0.1, z], [0.34, 0.2, 0.34], BARK);
    lit.add([x, base + 0.205, z], [0.26, 0.012, 0.26], STUMP_RING);
    lit.add([x + 0.2, base + 0.04, z + 0.05], [0.14, 0.08, 0.08], BARK);
  }
}
