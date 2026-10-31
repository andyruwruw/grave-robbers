// Packages
import { Euler } from 'three';

// Local Imports
import { pick } from '../../../helpers/pick';
import { ROPE, STAKE, STAKE_TIP } from '../../config/palette/structures';
import { WallPainter } from './wall-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * A palisade of sharpened stakes lashed with rope, along each wall line it
 * joins.
 */
export class PalisadePainter extends WallPainter {
  /**
   * Paints the palisade.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, rand } = p;
    for (const run of this.wallRuns(p)) {
      for (let i = 0; i < 4; i++) {
        const along = -0.375 + i * 0.25;
        const h = 1.05 + rand() * 0.2;
        const lean = new Euler((rand() - 0.5) * 0.08, run.yaw, (rand() - 0.5) * 0.08);
        lit.add(run.at(along, h / 2, 0), [0.21, h, 0.21], pick(rand, STAKE), lean);
        lit.add(run.at(along, h + 0.04, 0), [0.13, 0.13, 0.13], pick(rand, STAKE), new Euler(Math.PI / 4, run.yaw, Math.PI / 4));
        lit.add(run.at(along, h + 0.12, 0), [0.05, 0.1, 0.05], STAKE_TIP, run.turn);
      }
      for (const y of [0.32, 0.82]) {
        lit.add(run.at(0, y, 0.02), [1, 0.06, 0.24], ROPE, run.turn);
      }
    }
  }
}
