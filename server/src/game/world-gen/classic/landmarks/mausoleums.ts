// Local Imports
import { Landmark } from './landmark';

// Types
import type { Point, Rect } from '../../types/geometry';

/**
 * The mausoleums landmark: one to three mausoleums dotted around a
 * quadrant.
 */
export class Mausoleums extends Landmark {
  /**
   * One to three mausoleums dotted around a quadrant, each on its own with
   * a cobbled step in front (and sometimes a statue on it), linked to the
   * paths.
   * @param q The quadrant.
   * @returns Whether any fit.
   */
  tryIn(q: Rect): boolean {
    const count = 1 + Math.floor(this.rand() * 3);
    let built = 0;
    for (let i = 0; i < count; i++) {
      built += this.place(q, 3, 3, (r: Rect) => this.mausoleum(r)) ? 1 : 0;
    }
    return built > 0;
  }

  /**
   * One mausoleum with a cobbled step in front, sometimes with a statue on
   * it.
   * @param r The footprint.
   * @returns Its entrance.
   */
  private mausoleum(r: Rect): Point {
    this.fill({ x: r.x, y: r.y, w: 3, h: 2 }, 'mausoleum');
    for (let tx = r.x; tx < r.x + 3; tx++) {
      this.map.set(tx, r.y + 2, 'cobble');
    }
    if (this.rand() < 0.4) {
      this.map.set(r.x + (this.rand() < 0.5 ? 0 : 2), r.y + 2, 'statue');
    }
    return [r.x + 1, r.y + 2];
  }
}
