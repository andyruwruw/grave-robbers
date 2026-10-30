// Packages
import { Euler } from 'three';

// Local Imports
import { pick } from '../../../helpers/pick';
import { MIRROR_FRAME, MIRROR_GLASS, RUNE } from '../../config/palette/props';
import { SOCKET } from '../../config/palette/structures';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * A standing mirror, cracked, with a rune on its crest.
 */
export class MirrorPainter extends TilePainter {
  /**
   * Paints the mirror.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, glow, rand, x, z, base } = p;
    const frame = pick(rand, MIRROR_FRAME);
    lit.add([x, base + 0.05, z], [0.7, 0.1, 0.3], frame);
    lit.add([x, base + 0.75, z], [0.68, 1.3, 0.08], frame);
    lit.add([x, base + 1.45, z], [0.4, 0.12, 0.09], frame);
    lit.add([x, base + 0.77, z + 0.045], [0.54, 1.12, 0.01], MIRROR_GLASS);
    lit.add([x + 0.06, base + 0.85, z + 0.052], [0.015, 0.5, 0.005], SOCKET, new Euler(0, 0, 0.4));
    lit.add([x - 0.1, base + 0.6, z + 0.052], [0.015, 0.3, 0.005], SOCKET, new Euler(0, 0, -0.6));
    glow.add([x, base + 1.45, z + 0.05], [0.06, 0.06, 0.01], RUNE);
  }
}
