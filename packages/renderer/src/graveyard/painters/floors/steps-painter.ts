// Local Imports
import { PLANK, PLANK_DARK } from '../../config/palette/structures';
import { paintSteps } from '../../ground/stairs-painter';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * Wooden steps up to the next level.
 */
export class StepsPainter extends TilePainter {
  /**
   * Paints the steps.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    paintSteps(p, PLANK, [PLANK_DARK]);
  }
}
