// Local Imports
import { pick } from '../../../helpers/pick';
import { SOUL_GLOW } from '../../config/palette/props';
import { BONE, BONE_PACK, PALE_IRON } from '../../config/palette/structures';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * A bone pole with an iron cage and a soul glow.
 */
export class GhostLampPainter extends TilePainter {
  /**
   * Paints the ghost lamp.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, glow, rand, x, z, base } = p;
    lit.add([x, base + 0.04, z], [0.32, 0.08, 0.32], pick(rand, BONE));
    lit.add([x, base + 0.62, z], [0.1, 1.2, 0.1], BONE[1]);
    lit.add([x, base + 0.35, z], [0.14, 0.05, 0.14], BONE_PACK);
    lit.add([x, base + 1.25, z], [0.32, 0.05, 0.32], PALE_IRON);
    lit.add([x, base + 1.55, z], [0.32, 0.05, 0.32], PALE_IRON);
    lit.add([x, base + 1.62, z], [0.14, 0.1, 0.14], pick(rand, BONE));
    for (const [dx, dz] of [[-0.14, -0.14], [0.14, -0.14], [-0.14, 0.14], [0.14, 0.14]]) {
      lit.add([x + dx, base + 1.4, z + dz], [0.03, 0.3, 0.03], PALE_IRON);
    }
    glow.add([x, base + 1.12, z + 0.06], [0.04, 0.03, 0.01], SOUL_GLOW);
  }
}
