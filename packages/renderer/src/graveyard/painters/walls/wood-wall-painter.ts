// Local Imports
import { pick } from '../../../helpers/pick';
import { PLANK, PLANK_DARK } from '../../config/palette/structures';
import { WallPainter } from './wall-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * A wooden wall: four uneven planks with two cross rails.
 */
export class WoodWallPainter extends WallPainter {
  /**
   * Paints the wood wall.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, rand, x, z, base } = p;
    for (let i = 0; i < 4; i++) {
      const h = 1 + rand() * 0.15;
      const px = x - 0.375 + i * 0.25;
      lit.add([px, base + h / 2, z], [0.23, h, 0.3], pick(rand, PLANK));
      lit.add([px, base + h + 0.04, z], [0.12, 0.08, 0.12], pick(rand, PLANK));
    }
    lit.add([x, base + 0.3, z + 0.16], [1, 0.08, 0.04], PLANK_DARK);
    lit.add([x, base + 0.75, z + 0.16], [1, 0.08, 0.04], PLANK_DARK);
  }
}
