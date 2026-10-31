// Local Imports
import { ClassicPass } from '../classic-pass';

// Types
import type { Point, Rect } from '../../types/geometry';

/**
 * Hedged grave plots.
 */
export class PlotPass extends ClassicPass {
  /**
   * Hedged grave plots in the remaining open ground: up to `tries` random
   * spots, each built if it's open.
   * @param area Where they may go (the whole map inside the fence by default).
   * @param tries How many spots to try.
   */
  plots(area: Rect = { x: 2, y: 2, w: this.map.width - 4, h: this.map.height - 4 }, tries = 200): void {
    for (let i = 0; i < tries; i++) {
      const w = 5 + Math.floor(this.rand() * 5);
      const h = 4 + Math.floor(this.rand() * 4);
      const x = area.x + Math.floor(this.rand() * (area.w - w));
      const y = area.y + Math.floor(this.rand() * (area.h - h));
      if (this.isOpen({ x: x - 1, y: y - 1, w: w + 2, h: h + 2 })) {
        this.plot({ x, y, w, h });
      }
    }
  }

  /**
   * One plot: usually a hedge with a couple of gaps, graves in rows with
   * walkable lanes.
   * @param r The plot, hedge included.
   * @returns A gap in its hedge (its entrance).
   */
  plot(r: Rect): Point {
    const hedge = this.rand() < 0.7;
    const gaps = this.perimeter(r).filter((_: Point, i: number, all: Point[]): boolean => i % Math.max(3, Math.floor(all.length / 3)) === 1);
    for (const [px, py] of this.perimeter(r)) {
      const isGap = gaps.some(([gx, gy]): boolean => Math.abs(gx - px) + Math.abs(gy - py) <= 1);
      if (hedge && !isGap && !this.isCorner(r, px, py)) {
        this.map.set(px, py, 'hedge');
      }
    }
    for (let ty = r.y + 1; ty < r.y + r.h - 1; ty++) {
      for (let tx = r.x + 1; tx < r.x + r.w - 1; tx++) {
        if ((ty - r.y) % 2 === 1 && (tx - r.x) % 2 === 1 && this.rand() < Math.min(1, 0.8 * this.gen.graves)) {
          this.map.set(tx, ty, this.rand() < 0.65 ? 'tombstone' : 'cross');
        }
      }
    }
    return gaps[0];
  }
}
