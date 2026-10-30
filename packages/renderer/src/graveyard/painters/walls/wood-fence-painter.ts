// Local Imports
import { pick } from '../../../helpers/pick';
import { PLANK, PLANK_DARK } from '../../config/palette/structures';
import { WallPainter } from './wall-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * A wooden fence post with rails toward each wall it joins.
 */
export class WoodFencePainter extends WallPainter {
  /**
   * Paints the wood fence.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, rand, x, z, base } = p;
    lit.add([x, base + 0.35, z], [0.12, 0.7, 0.12], PLANK_DARK);
    lit.add([x, base + 0.73, z], [0.08, 0.06, 0.08], PLANK_DARK);
    const sides: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => this.joins(p, dx, dy)) as [number, number][];
    for (const [dx, dy] of sides.length > 0 ? sides : [[1, 0], [-1, 0]] as [number, number][]) {
      for (const h of [0.25, 0.55]) {
        lit.add([x + dx * 0.25, base + h, z + dy * 0.25], dx !== 0 ? [0.5, 0.07, 0.05] : [0.05, 0.07, 0.5], pick(rand, PLANK));
      }
    }
  }
}
