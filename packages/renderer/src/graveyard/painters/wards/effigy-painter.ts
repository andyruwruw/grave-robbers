// Packages
import { Euler } from 'three';

// Local Imports
import { pick } from '../../../helpers/pick';
import { STRAW } from '../../config/palette/props';
import { BONE, ROPE, STAKE } from '../../config/palette/structures';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * A straw effigy with a skull head, glowing eyes, hanging bones and candles.
 */
export class EffigyPainter extends TilePainter {
  /**
   * Paints the effigy.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, glow, rand, x, z, base } = p;
    lit.add([x, base + 0.7, z], [0.09, 1.4, 0.09], pick(rand, STAKE));
    lit.add([x, base + 1.05, z], [0.7, 0.07, 0.07], pick(rand, STAKE), new Euler(0, 0, 0.12));
    lit.add([x, base + 0.75, z], [0.3, 0.5, 0.2], STRAW);
    lit.add([x, base + 0.75, z], [0.32, 0.05, 0.22], ROPE);
    lit.add([x, base + 0.6, z], [0.32, 0.05, 0.22], ROPE);
    lit.add([x, base + 1.25, z], [0.2, 0.18, 0.2], pick(rand, BONE));
    lit.add([x, base + 1.18, z + 0.04], [0.14, 0.06, 0.15], BONE[1]);
    glow.add([x - 0.045, base + 1.27, z + 0.101], [0.04, 0.04, 0.01], '#ff3a2a');
    glow.add([x + 0.045, base + 1.27, z + 0.101], [0.04, 0.04, 0.01], '#ff3a2a');
    for (const side of [-1, 1]) {
      lit.add([x + side * 0.1, base + 1.42, z], [0.04, 0.22, 0.04], pick(rand, STAKE), new Euler(0, 0, -side * 0.5));
      lit.add([x + side * 0.3, base + 0.95, z], [0.03, 0.14, 0.03], ROPE);
      lit.add([x + side * 0.3, base + 0.85, z], [0.06, 0.06, 0.06], pick(rand, BONE));
    }
    this.candle(lit, glow, [x - 0.25, base, z + 0.2], 0.12);
    this.candle(lit, glow, [x + 0.22, base, z + 0.24], 0.09);
  }
}
