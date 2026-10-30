// Local Imports
import { COURTYARD_SIZES } from '../../config/classic';
import { Landmark } from './landmark';

// Types
import type { Tile } from '@halloween/shared/world/tiles';
import type { Point, Rect } from '../../types/geometry';

/**
 * A landmark on a round courtyard, tried at each of COURTYARD_SIZES in a
 * random order (reshuffled on every try) until one fits.
 */
export abstract class CourtyardLandmark extends Landmark {
  /**
   * Tries each courtyard size in a random order and builds at the first
   * that fits.
   * @param q The quadrant.
   * @returns Whether it fit.
   */
  tryIn(q: Rect): boolean {
    return this.shuffle([...COURTYARD_SIZES]).some((n: number): boolean => this.place(q, n, n, (r: Rect) => this.build(r)));
  }

  /**
   * Builds the landmark on its courtyard.
   * @param r The footprint.
   * @returns Its entrance.
   */
  protected abstract build(r: Rect): Point;

  /**
   * Fills the round part of a square footprint (corners left as they were).
   * @param r The footprint.
   * @param tile What to fill it with.
   * @returns The tiles filled.
   */
  protected disk(r: Rect, tile: Tile): Point[] {
    const cx = r.x + (r.w - 1) / 2;
    const cy = r.y + (r.h - 1) / 2;
    const radius = (r.w - 1) / 2 + 0.35;
    const tiles: Point[] = [];
    for (let ty = r.y; ty < r.y + r.h; ty++) {
      for (let tx = r.x; tx < r.x + r.w; tx++) {
        if (Math.hypot(tx - cx, ty - cy) <= radius) {
          this.map.set(tx, ty, tile);
          tiles.push([tx, ty]);
        }
      }
    }
    return tiles;
  }
}
