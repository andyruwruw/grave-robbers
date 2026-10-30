// Packages
import { MAP_HEIGHT, MAP_WIDTH } from '@halloween/shared/world/dimensions';

// Local Imports
import { OPEN } from '../../config/classic';
import { ClassicPass } from '../classic-pass';

// Types
import type { Point } from '../../types/geometry';

/**
 * The uneven forest along the fence.
 */
export class ForestPass extends ClassicPass {
  /**
   * Uneven forest along the fence, deepest in noisy bands, with a few
   * clearings left open.
   */
  forestEdge(): void {
    const clearings = Array.from({ length: 5 }, (): Point => {
      const side = Math.floor(this.rand() * 4);
      const along = this.rand();
      return [
        side < 2 ? Math.floor(along * MAP_WIDTH) : side === 2 ? 3 : MAP_WIDTH - 4,
        side >= 2 ? Math.floor(along * MAP_HEIGHT) : side === 0 ? 3 : MAP_HEIGHT - 4,
      ];
    });
    const phase = this.rand() * 10;
    for (let ty = 1; ty < MAP_HEIGHT - 1; ty++) {
      for (let tx = 1; tx < MAP_WIDTH - 1; tx++) {
        if (!OPEN.has(this.map.get(tx, ty))) {
          continue;
        }
        const depth = (3.2 + 1.6 * Math.sin((tx + ty) * 0.35 + phase) * Math.sin(tx * 0.17 - ty * 0.23 + phase)) * this.gen.forest;
        const edge = this.edge(tx, ty);
        const inClearing = clearings.some(([cx, cy]): boolean => Math.hypot(tx - cx, ty - cy) < 2.5);
        if (edge <= depth && !inClearing && this.rand() < 0.75) {
          this.map.set(tx, ty, 'tree');
        }
      }
    }
  }
}
