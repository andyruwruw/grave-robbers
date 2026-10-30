// Local Imports
import { pick } from '../../../helpers/pick';
import { STONE } from '../../config/palette/ground';
import { BELL_GLEAM, SILVER } from '../../config/palette/props';
import { IRON, PLANK, PLANK_DARK, SOCKET } from '../../config/palette/structures';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * A silver bell hung from a wooden frame.
 */
export class BellPainter extends TilePainter {
  /**
   * Paints the bell.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, glow, rand, x, z, base } = p;
    for (const side of [-1, 1]) {
      lit.add([x + side * 0.38, base + 0.04, z], [0.22, 0.08, 0.22], pick(rand, STONE));
      lit.add([x + side * 0.38, base + 0.7, z], [0.1, 1.36, 0.1], PLANK_DARK);
      this.stick(lit, [x + side * 0.38, base + 1.08, z], [x + side * 0.18, base + 1.34, z], 0.05, PLANK_DARK);
    }
    lit.add([x, base + 1.38, z], [0.96, 0.1, 0.12], pick(rand, PLANK));
    lit.add([x, base + 1.28, z], [0.02, 0.1, 0.02], IRON);
    lit.add([x, base + 1.24, z], [0.16, 0.04, 0.08], IRON);
    for (const [y, w, h, color] of [[1.2, 0.12, 0.05, SILVER[1]], [1.13, 0.2, 0.1, SILVER[0]], [1.04, 0.24, 0.1, SILVER[0]], [0.96, 0.3, 0.08, SILVER[0]], [0.9, 0.38, 0.06, SILVER[1]]] as const) {
      lit.add([x, base + y, z], [w, h, w * 0.7], color);
      lit.add([x, base + y, z], [w * 0.7, h, w], color);
    }
    lit.add([x, base + 0.865, z], [0.34, 0.01, 0.34], SOCKET);
    lit.add([x, base + 0.84, z], [0.07, 0.07, 0.07], IRON);
    glow.add([x - 0.06, base + 1.06, z + 0.136], [0.03, 0.12, 0.01], BELL_GLEAM);
    glow.add([x - 0.1, base + 0.92, z + 0.2], [0.05, 0.03, 0.01], BELL_GLEAM);
  }
}
