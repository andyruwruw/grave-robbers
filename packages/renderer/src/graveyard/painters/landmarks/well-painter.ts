// Packages
import { Euler } from 'three';

// Local Imports
import { pick } from '../../../helpers/pick';
import { STONE } from '../../config/palette/ground';
import { PLANK_DARK, WATER } from '../../config/palette/structures';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * A stone well with water, posts and a crank.
 */
export class WellPainter extends TilePainter {
  /**
   * Paints the well.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, rand, x, z } = p;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      lit.add([x + Math.cos(a) * 0.36, 0.25, z + Math.sin(a) * 0.36], [0.24, 0.5, 0.24], pick(rand, STONE), new Euler(0, -a, 0));
    }
    lit.add([x, 0.3, z], [0.5, 0.02, 0.5], WATER);
    lit.add([x - 0.42, 0.75, z], [0.08, 1.5, 0.08], PLANK_DARK);
    lit.add([x + 0.42, 0.75, z], [0.08, 1.5, 0.08], PLANK_DARK);
    lit.add([x, 1.25, z], [0.9, 0.06, 0.06], PLANK_DARK);
    lit.add([x + 0.1, 0.95, z], [0.14, 0.16, 0.14], PLANK_DARK);
  }
}
