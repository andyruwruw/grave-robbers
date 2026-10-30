// Packages
import { Euler } from 'three';

// Local Imports
import { pick } from '../../../helpers/pick';
import { STONE } from '../../config/palette/ground';
import { BRICK, EMBER_STONE, FURNACE_STONE, IRON, SOOT } from '../../config/palette/structures';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * A stone furnace with an ember floor, a chimney, and stones at its foot.
 */
export class FurnacePainter extends TilePainter {
  /**
   * Paints the furnace.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, rand, x, z, base } = p;
    lit.add([x, base + 0.06, z], [0.84, 0.12, 0.78], pick(rand, FURNACE_STONE));
    for (const side of [-1, 1]) {
      for (let row = 0; row < 3; row++) {
        lit.add([x + side * 0.29, base + 0.22 + row * 0.2, z], [0.22, 0.19, 0.72 - rand() * 0.04], pick(rand, FURNACE_STONE));
      }
    }
    lit.add([x, base + 0.42, z - 0.24], [0.4, 0.6, 0.24], pick(rand, FURNACE_STONE));
    lit.add([x, base + 0.13, z + 0.06], [0.36, 0.03, 0.56], EMBER_STONE);
    lit.add([x, base + 0.6, z + 0.03], [0.4, 0.24, 0.66], pick(rand, FURNACE_STONE));
    lit.add([x, base + 0.53, z + 0.34], [0.46, 0.1, 0.08], pick(rand, BRICK));
    lit.add([x, base + 0.81, z], [0.8, 0.18, 0.74], pick(rand, FURNACE_STONE));
    lit.add([x, base + 0.96, z - 0.02], [0.58, 0.14, 0.52], pick(rand, FURNACE_STONE));
    lit.add([x, base + 0.63, z + 0.372], [0.24, 0.07, 0.01], SOOT);
    lit.add([x + 0.14, base + 1.24, z - 0.14], [0.24, 0.46, 0.24], pick(rand, BRICK));
    lit.add([x + 0.14, base + 1.49, z - 0.14], [0.3, 0.06, 0.3], SOOT);
    for (const bx of [-0.12, 0, 0.12]) {
      lit.add([x + bx, base + 0.15, z + 0.33], [0.03, 0.03, 0.08], IRON);
    }
    for (let i = 0; i < 2; i++) {
      const s = 0.1 + rand() * 0.06;
      lit.add([x - 0.3 + i * 0.12, base + s / 2, z + 0.44], [s, s * 0.8, s], pick(rand, STONE), new Euler(0, rand() * Math.PI, 0));
    }
  }
}
