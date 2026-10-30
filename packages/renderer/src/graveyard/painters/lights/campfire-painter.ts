// Packages
import { Euler } from 'three';

// Local Imports
import { pick } from '../../../helpers/pick';
import { STONE } from '../../config/palette/ground';
import { EMBER_STONE, PLANK } from '../../config/palette/structures';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * A campfire: a ring of stones around crossed logs (its flames are animated by
 * `Flames`).
 */
export class CampfirePainter extends TilePainter {
  /**
   * Paints the campfire.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, rand, x, z, base } = p;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      lit.add([x + Math.cos(a) * 0.36, base + 0.07, z + Math.sin(a) * 0.36], [0.17, 0.14, 0.17], i % 2 ? EMBER_STONE : pick(rand, STONE), new Euler(0, a, 0));
    }
    lit.add([x, base + 0.1, z], [0.56, 0.1, 0.1], pick(rand, PLANK), new Euler(0, Math.PI / 4, 0.25));
    lit.add([x, base + 0.1, z], [0.56, 0.1, 0.1], pick(rand, PLANK), new Euler(0, -Math.PI / 4, 0.25));
    lit.add([x, base + 0.14, z], [0.5, 0.1, 0.1], pick(rand, PLANK), new Euler(0, Math.PI / 2, -0.2));
  }
}
