// Packages
import { MAP_HEIGHT, MAP_WIDTH } from '@halloween/shared/world/dimensions';

// Local Imports
import { ClassicPass } from '../classic-pass';

// Types
import type { Point } from '../../types/geometry';

/**
 * Hedged grave plots.
 */
export class PlotPass extends ClassicPass {
  /**
   * Hedged grave plots in the remaining open ground. Each hedge has a
   * couple of gaps, and graves sit in rows with walkable lanes.
   */
  plots(): void {
    for (let tries = 0; tries < 200; tries++) {
      const w = 5 + Math.floor(this.rand() * 5);
      const h = 4 + Math.floor(this.rand() * 4);
      const x = 2 + Math.floor(this.rand() * (MAP_WIDTH - w - 4));
      const y = 2 + Math.floor(this.rand() * (MAP_HEIGHT - h - 4));
      const r = { x, y, w, h };
      if (!this.isOpen({ x: x - 1, y: y - 1, w: w + 2, h: h + 2 })) {
        continue;
      }
      const hedge = this.rand() < 0.7;
      const gaps = this.perimeter(r).filter((_: Point, i: number, all: Point[]): boolean => i % Math.max(3, Math.floor(all.length / 3)) === 1);
      for (const [px, py] of this.perimeter(r)) {
        const isGap = gaps.some(([gx, gy]): boolean => Math.abs(gx - px) + Math.abs(gy - py) <= 1);
        if (hedge && !isGap && !this.isCorner(r, px, py)) {
          this.map.set(px, py, 'hedge');
        }
      }
      for (let ty = y + 1; ty < y + h - 1; ty++) {
        for (let tx = x + 1; tx < x + w - 1; tx++) {
          if ((ty - y) % 2 === 1 && (tx - x) % 2 === 1 && this.rand() < Math.min(1, 0.8 * this.gen.graves)) {
            this.map.set(tx, ty, this.rand() < 0.65 ? 'tombstone' : 'cross');
          }
        }
      }
    }
  }
}
