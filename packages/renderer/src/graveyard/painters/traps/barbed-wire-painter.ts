// Packages
import { Euler } from 'three';

// Local Imports
import { pick } from '../../../helpers/pick';
import { PALE_IRON, STAKE, WIRE } from '../../config/palette/structures';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * Barbed wire strung between two stakes.
 */
export class BarbedWirePainter extends TilePainter {
  /**
   * Paints the barbed wire.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, rand, x, z, base } = p;
    for (const side of [-1, 1]) {
      lit.add([x + side * 0.42, base + 0.3, z], [0.08, 0.6, 0.08], pick(rand, STAKE));
    }
    for (const [y, dz] of [[0.16, -0.03], [0.32, 0.03], [0.48, -0.02]]) {
      lit.add([x, base + y, z + dz], [0.86, 0.02, 0.02], WIRE);
      for (let i = 0; i < 5; i++) {
        lit.add([x - 0.32 + i * 0.16, base + y, z + dz], [0.02, 0.07, 0.07], PALE_IRON, new Euler(0.6, 0, 0.6));
      }
    }
  }
}
