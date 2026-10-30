// Local Imports
import { pick } from '../../../helpers/pick';
import { BONE, IRON, PALE_IRON } from '../../config/palette/structures';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * An iron and bone cage holding a glowing soul.
 */
export class SoulCagePainter extends TilePainter {
  /**
   * Paints the soul cage.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, glow, rand, x, z, base } = p;
    lit.add([x, base + 0.05, z], [0.66, 0.1, 0.66], IRON);
    lit.add([x, base + 1.12, z], [0.62, 0.06, 0.62], IRON);
    for (const [dx, dz] of [[-0.28, -0.28], [0.28, -0.28], [-0.28, 0.28], [0.28, 0.28]]) {
      lit.add([x + dx, base + 0.58, z + dz], [0.06, 1.06, 0.06], pick(rand, BONE));
    }
    for (const [dx, dz] of [[0, -0.28], [0, 0.28], [-0.28, 0], [0.28, 0]]) {
      lit.add([x + dx, base + 0.58, z + dz], [dx ? 0.02 : 0.02, 1.0, 0.02], PALE_IRON);
    }
    lit.add([x, base + 1.24, z], [0.18, 0.16, 0.18], pick(rand, BONE));
    glow.add([x, base + 0.55, z], [0.2, 0.28, 0.2], '#b8ffe0');
    glow.add([x, base + 0.75, z], [0.12, 0.12, 0.12], '#e8fff4');
  }
}
