// Local Imports
import { pick } from '../../../helpers/pick';
import { BURLAP, STRAW } from '../../config/palette/props';
import { DOORWAY, PLANK_DARK } from '../../config/palette/structures';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * A scarecrow on a pole, with a straw-stuffed body and a hat.
 */
export class ScarecrowPainter extends TilePainter {
  /**
   * Paints the scarecrow.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, rand, x, z, base } = p;
    lit.add([x, base + 0.65, z], [0.1, 1.3, 0.1], PLANK_DARK);
    lit.add([x, base + 1.0, z], [0.95, 0.08, 0.08], PLANK_DARK);
    lit.add([x, base + 0.85, z], [0.36, 0.5, 0.24], pick(rand, BURLAP));
    lit.add([x - 0.48, base + 1.0, z], [0.1, 0.14, 0.1], STRAW);
    lit.add([x + 0.48, base + 1.0, z], [0.1, 0.14, 0.1], STRAW);
    lit.add([x, base + 0.56, z], [0.3, 0.12, 0.2], STRAW);
    lit.add([x, base + 1.26, z], [0.27, 0.27, 0.27], BURLAP[1]);
    lit.add([x - 0.06, base + 1.28, z + 0.14], [0.05, 0.05, 0.02], DOORWAY);
    lit.add([x + 0.06, base + 1.28, z + 0.14], [0.05, 0.05, 0.02], DOORWAY);
    lit.add([x, base + 1.41, z], [0.46, 0.04, 0.46], PLANK_DARK);
    lit.add([x, base + 1.52, z], [0.22, 0.18, 0.22], PLANK_DARK);
  }
}
