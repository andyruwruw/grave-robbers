// Local Imports
import { pick } from '../../../helpers/pick';
import { HEDGE } from '../../config/palette/ground';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * A hedge block, widened along a hedge row.
 */
export class HedgePainter extends TilePainter {
  /**
   * Paints the hedge.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, rand, map, tx, ty, x, z } = p;
    const wide = map.get(tx - 1, ty) === 'hedge' || map.get(tx + 1, ty) === 'hedge';
    lit.add([x, 0.35, z], [wide ? 1 : 0.85, 0.7, wide ? 0.85 : 1], pick(rand, HEDGE));
    for (let i = 0; i < 3; i++) {
      lit.add([x + (rand() - 0.5) * 0.6, 0.7 + rand() * 0.1, z + (rand() - 0.5) * 0.5], [0.3, 0.2, 0.3], pick(rand, HEDGE));
    }
  }
}
