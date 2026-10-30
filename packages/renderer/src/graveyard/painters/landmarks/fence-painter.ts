// Local Imports
import { IRON } from '../../config/palette/structures';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * The iron fence around the graveyard: a post with a finial, and rails toward
 * the fence east and south.
 */
export class FencePainter extends TilePainter {
  /**
   * Paints the fence.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, map, tx, ty, x, z } = p;
    lit.add([x, 0.55, z], [0.14, 1.1, 0.14], IRON);
    lit.add([x, 1.16, z], [0.06, 0.12, 0.06], IRON);
    if (map.get(tx + 1, ty) === 'fence') {
      lit.add([x + 0.5, 0.3, z], [1, 0.06, 0.06], IRON);
      lit.add([x + 0.5, 0.85, z], [1, 0.06, 0.06], IRON);
      lit.add([x + 0.5, 0.6, z], [0.06, 0.8, 0.06], IRON);
    }
    if (map.get(tx, ty + 1) === 'fence') {
      lit.add([x, 0.3, z + 0.5], [0.06, 0.06, 1], IRON);
      lit.add([x, 0.85, z + 0.5], [0.06, 0.06, 1], IRON);
      lit.add([x, 0.6, z + 0.5], [0.06, 0.8, 0.06], IRON);
    }
  }
}
