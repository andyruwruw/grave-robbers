// Packages
import { Euler } from 'three';

// Local Imports
import { pick } from '../../../helpers/pick';
import { DIRT, STONE } from '../../config/palette/ground';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * A tombstone over its grave plot, in one of three styles: an upright slab, an
 * obelisk, or a slab fallen flat.
 */
export class TombstonePainter extends TilePainter {
  /**
   * Paints the tombstone.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, rand, x, z, base } = p;
    const style = rand();
    const stone = pick(rand, STONE);
    const tilt = new Euler((rand() - 0.5) * 0.15, (rand() - 0.5) * 0.3, (rand() - 0.5) * 0.15);
    lit.add([x, base + 0.04, z + 0.3], [0.5, 0.08, 0.5], pick(rand, DIRT));
    if (style < 0.55) {
      lit.add([x, base + 0.05, z - 0.05], [0.7, 0.1, 0.4], pick(rand, STONE));
      lit.add([x, base + 0.45, z - 0.1], [0.5, 0.7, 0.16], stone, tilt);
      lit.add([x, base + 0.84, z - 0.1], [0.34, 0.1, 0.16], stone, tilt);
    } else if (style < 0.8) {
      lit.add([x, base + 0.1, z - 0.1], [0.4, 0.2, 0.4], pick(rand, STONE));
      lit.add([x, base + 0.7, z - 0.1], [0.2, 1.0, 0.2], stone);
      lit.add([x, base + 1.25, z - 0.1], [0.12, 0.12, 0.12], stone, new Euler(0, Math.PI / 4, 0));
    } else {
      lit.add([x, base + 0.08, z + 0.05], [0.5, 0.16, 0.8], stone, tilt);
      lit.add([x, base + 0.3, z - 0.32], [0.46, 0.4, 0.12], pick(rand, STONE));
    }
  }
}
