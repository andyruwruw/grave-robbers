// Packages
import { Euler } from 'three';

// Local Imports
import { pick } from '../../../helpers/pick';
import { CANDLE, OVEN_FIRE, PUMPKIN, PUMPKIN_STEM } from '../../config/palette/props';
import { BONE, BRICK, FURNACE_STONE, SOOT } from '../../config/palette/structures';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * A stepped stone oven with fire in its mouth, a pumpkin on top and skulls
 * beside.
 */
export class OvenPainter extends TilePainter {
  /**
   * Paints the oven.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, glow, rand, x, z, base } = p;
    for (const [y, w] of [[0.15, 0.86], [0.42, 0.8], [0.66, 0.66], [0.84, 0.46], [0.96, 0.24]] as const) {
      lit.add([x, base + y, z], [w, 0.28, w * 0.9], pick(rand, FURNACE_STONE));
    }
    lit.add([x, base + 0.3, z + 0.36], [0.4, 0.34, 0.12], SOOT);
    glow.add([x, base + 0.26, z + 0.41], [0.32, 0.22, 0.02], pick(rand, OVEN_FIRE));
    for (let i = 0; i < 3; i++) {
      glow.add([x - 0.1 + i * 0.1, base + 0.2, z + 0.38], [0.07, 0.07 + rand() * 0.06, 0.06], pick(rand, OVEN_FIRE));
    }
    lit.add([x + 0.22, base + 1.05, z - 0.18], [0.14, 0.4, 0.14], pick(rand, BRICK));
    lit.add([x, base + 1.13, z], [0.26, 0.2, 0.24], PUMPKIN);
    lit.add([x, base + 1.26, z], [0.05, 0.08, 0.05], PUMPKIN_STEM);
    glow.add([x - 0.05, base + 1.15, z + 0.121], [0.05, 0.04, 0.01], CANDLE);
    glow.add([x + 0.05, base + 1.15, z + 0.121], [0.05, 0.04, 0.01], CANDLE);
    for (const side of [-1, 1]) {
      this.skull(lit, this.turned(x + side * 0.3, z + 0.35, base, side * 0.3), new Euler(0, side * 0.3, 0), 0, 0.62, 0, 0.12, pick(rand, BONE));
    }
  }
}
