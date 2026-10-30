// Packages
import { Euler } from 'three';

// Local Imports
import { pick } from '../../../helpers/pick';
import { DIRT, VINE } from '../../config/palette/ground';
import { PUMPKIN } from '../../config/palette/props';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * A pumpkin sprout: dirt, vines, leaves and a small pumpkin.
 */
export class SproutPainter extends TilePainter {
  /**
   * Paints the sprout.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, rand, x, z, base } = p;
    lit.add([x, base + 0.04, z], [0.56, 0.08, 0.56], pick(rand, DIRT), new Euler(0, rand() * Math.PI, 0));
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + rand() * 0.5;
      this.stick(lit, [x, base + 0.08, z], [x + Math.cos(a) * 0.3, base + 0.12, z + Math.sin(a) * 0.3], 0.03, VINE[2]);
      lit.add([x + Math.cos(a) * 0.22, base + 0.18, z + Math.sin(a) * 0.22], [0.14, 0.03, 0.12], pick(rand, VINE), new Euler(0, a, 0.2));
    }
    this.stick(lit, [x, base + 0.08, z], [x + 0.03, base + 0.32, z], 0.035, VINE[2]);
    lit.add([x + 0.03, base + 0.34, z], [0.16, 0.04, 0.12], pick(rand, VINE), new Euler(0, rand() * Math.PI, 0.3));
    lit.add([x - 0.12, base + 0.1, z + 0.1], [0.12, 0.09, 0.11], PUMPKIN);
  }
}
