// Local Imports
import { pick } from '../../../helpers/pick';
import { BRICK } from '../../config/palette/structures';
import { WallPainter } from './wall-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * A stone wall of staggered brick courses.
 */
export class StoneWallPainter extends WallPainter {
  /**
   * Paints the stone wall.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, rand, x, z, base } = p;
    for (let row = 0; row < 3; row++) {
      const by = base + 0.15 + row * 0.3;
      const bricks: [number, number][] = row % 2 === 0 ? [[-0.25, 0.48], [0.25, 0.48]] : [[-0.375, 0.23], [0, 0.48], [0.375, 0.23]];
      for (const [bx, w] of bricks) {
        lit.add([x + bx, by, z], [w, 0.28, 0.9], pick(rand, BRICK));
      }
    }
  }
}
