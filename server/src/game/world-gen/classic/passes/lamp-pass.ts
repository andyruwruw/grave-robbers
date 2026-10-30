// Local Imports
import { ClassicPass } from '../classic-pass';

// Types
import type { Point } from '../../types/geometry';

/**
 * Lamp posts along the main paths.
 */
export class LampPass extends ClassicPass {
  /**
   * Lamp posts beside the main paths every so often, alternating sides.
   * @param arms The main paths, crypt end first.
   */
  lamps(arms: Point[][]): void {
    for (const arm of arms) {
      for (let i = 4; i < arm.length - 2; i += 7) {
        const [x, y] = arm[i];
        const horizontal = Math.abs(arm[arm.length - 1][0] - arm[0][0]) > Math.abs(arm[arm.length - 1][1] - arm[0][1]);
        const side = (i / 7) % 2 < 1 ? -1 : 2;
        const [lx, ly] = horizontal ? [x, y + side] : [x + side, y];
        if (this.map.get(lx, ly) === 'grass' || this.map.get(lx, ly) === 'tree') {
          this.map.set(lx, ly, 'lamp');
        }
      }
    }
  }
}
