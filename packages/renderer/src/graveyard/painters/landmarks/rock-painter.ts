// Packages
import { Euler } from 'three';

// Local Imports
import { pick } from '../../../helpers/pick';
import { BOULDER, STONE } from '../../config/palette/ground';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * A pair of boulders with a loose stone.
 */
export class RockPainter extends TilePainter {
  /**
   * Paints the rock.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, rand, x, z, base } = p;
    lit.add([x, base + 0.2, z], [0.7, 0.4, 0.6], pick(rand, BOULDER), new Euler(0, rand() * Math.PI, 0));
    lit.add([x + (rand() - 0.5) * 0.2, base + 0.45, z + (rand() - 0.5) * 0.2], [0.42, 0.24, 0.4], pick(rand, BOULDER), new Euler(0, rand() * Math.PI, 0));
    lit.add([x + 0.3, base + 0.08, z + 0.25], [0.2, 0.16, 0.2], pick(rand, STONE));
  }
}
