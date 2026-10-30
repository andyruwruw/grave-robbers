// Local Imports
import { DIRS } from '../../config/classic';
import { CourtyardLandmark } from './courtyard-landmark';

// Types
import type { Point, Rect } from '../../types/geometry';

/**
 * The ruined chapel landmark.
 */
export class Chapel extends CourtyardLandmark {
  /**
   * A ruined chapel: broken walls with a doorway toward the center, a few
   * extra collapsed gaps, a flagstone floor, and a statue at the altar.
   * @param r The footprint.
   * @returns Its entrance.
   */
  protected build(r: Rect): Point {
    const disk = this.disk(r, 'flagstone');
    const door = this.doorTowardCenter(r);
    const ring = disk.filter(([px, py]): boolean => DIRS.some(([dx, dy]): boolean => !disk.some(([qx, qy]): boolean => qx === px + dx && qy === py + dy)));
    const broken = new Set(Array.from({ length: 2 + Math.floor(r.w / 4) }, (): number => Math.floor(this.rand() * ring.length)));
    ring.forEach(([px, py]: Point, i: number): void => {
      const isDoor = Math.abs(px - door[0]) + Math.abs(py - door[1]) <= 1;
      if (!isDoor && !broken.has(i)) {
        this.map.set(px, py, 'ruin');
      }
    });
    const cx = r.x + Math.floor(r.w / 2);
    const cy = r.y + Math.floor(r.h / 2);
    const altar: Point = [cx + Math.sign(cx - door[0]) * Math.floor(r.w / 2 - 1.5), cy + Math.sign(cy - door[1]) * Math.floor(r.h / 2 - 1.5)];
    this.map.set(altar[0], altar[1], 'statue');
    return door;
  }
}
