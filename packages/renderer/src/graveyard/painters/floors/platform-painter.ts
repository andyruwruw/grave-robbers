// Packages
import { Euler } from 'three';
import { LEVEL_HEIGHT } from '@halloween/shared/world/dimensions';

// Local Imports
import { pick } from '../../../helpers/pick';
import { PLANK, PLANK_DARK } from '../../config/palette/structures';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * A raised wooden platform: posts, braces, a plank deck, and rails along each
 * open edge.
 */
export class PlatformPainter extends TilePainter {
  /**
   * Paints the platform.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, rand, map, tx, ty, x, z, base } = p;
    const deck = base + LEVEL_HEIGHT;
    for (const [ox, oz] of [[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]]) {
      lit.add([x + ox, base + LEVEL_HEIGHT / 2, z + oz], [0.12, LEVEL_HEIGHT, 0.12], PLANK_DARK);
    }
    lit.add([x, base + 0.3, z + 0.4], [0.9, 0.06, 0.06], PLANK_DARK, new Euler(0, 0, 0.5));
    lit.add([x + 0.4, base + 0.3, z], [0.06, 0.06, 0.9], PLANK_DARK, new Euler(0.5, 0, 0));
    for (let i = 0; i < 4; i++) {
      lit.add([x - 0.375 + i * 0.25, deck - 0.04, z], [0.23, 0.08, 1], pick(rand, PLANK));
    }
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const n = map.get(tx + dx, ty + dy);
      if (n === 'platform' || n === 'steps' || map.base(tx + dx, ty + dy) >= deck - 0.01) {
        continue;
      }
      lit.add([x + dx * 0.45, deck + 0.25, z + dy * 0.45], dx !== 0 ? [0.06, 0.06, 0.9] : [0.9, 0.06, 0.06], PLANK_DARK);
      lit.add([x + dx * 0.45 + dy * 0.4, deck + 0.13, z + dy * 0.45 + dx * 0.4], [0.06, 0.26, 0.06], PLANK_DARK);
      lit.add([x + dx * 0.45 - dy * 0.4, deck + 0.13, z + dy * 0.45 - dx * 0.4], [0.06, 0.26, 0.06], PLANK_DARK);
    }
  }
}
