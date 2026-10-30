// Packages
import { Euler } from 'three';

// Local Imports
import { pick } from '../../../helpers/pick';
import { OBELISK_STONE, RUNE } from '../../config/palette/props';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * A dark obelisk with glowing runes down each face.
 */
export class ObeliskPainter extends TilePainter {
  /**
   * Paints the obelisk.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, glow, rand, x, z, base } = p;
    lit.add([x, base + 0.07, z], [0.72, 0.14, 0.72], pick(rand, OBELISK_STONE));
    lit.add([x, base + 0.2, z], [0.5, 0.12, 0.5], pick(rand, OBELISK_STONE));
    lit.add([x, base + 0.95, z], [0.34, 1.4, 0.34], pick(rand, OBELISK_STONE));
    lit.add([x, base + 1.75, z], [0.24, 0.24, 0.24], pick(rand, OBELISK_STONE));
    lit.add([x, base + 1.92, z], [0.12, 0.12, 0.12], pick(rand, OBELISK_STONE), new Euler(0, Math.PI / 4, 0));
    for (const [dx, dz] of [[0.171, 0], [-0.171, 0], [0, 0.171], [0, -0.171]]) {
      for (const y of [0.55, 0.85, 1.2, 1.5]) {
        glow.add([x + dx, base + y + rand() * 0.05, z + dz], [dx ? 0.01 : 0.08, 0.1, dz ? 0.01 : 0.08], RUNE);
      }
    }
  }
}
