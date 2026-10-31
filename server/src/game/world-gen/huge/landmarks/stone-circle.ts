// Local Imports
import { DIRS } from '../../config/classic';
import { CourtyardLandmark } from '../../classic/landmarks/courtyard-landmark';

// Types
import type { Point, Rect } from '../../types/geometry';

/**
 * A stone circle site: a ring of statues around a light.
 */
export class StoneCircle extends CourtyardLandmark {
  /**
   * A ring of statues with gaps between them (and a wide gap toward the
   * road) on a round patch of grass, around a flagstone cross with a lamp
   * post (or a statue, when lamps are off) at its heart.
   * @param r The footprint.
   * @returns Its entrance.
   */
  protected build(r: Rect): Point {
    const disk = this.disk(r, 'grass');
    const door = this.doorTowardCenter(r);
    const ring = disk.filter(([px, py]): boolean => DIRS.some(([dx, dy]): boolean => !disk.some(([qx, qy]): boolean => qx === px + dx && qy === py + dy)));
    ring.forEach(([px, py]: Point, i: number): void => {
      if (i % 2 === 0 && Math.abs(px - door[0]) + Math.abs(py - door[1]) > 1) {
        this.map.set(px, py, 'statue');
      }
    });
    const cx = r.x + Math.floor(r.w / 2);
    const cy = r.y + Math.floor(r.h / 2);
    for (const [dx, dy] of DIRS) {
      this.map.set(cx + dx, cy + dy, 'flagstone');
    }
    this.map.set(cx, cy, this.gen.structures.lamps ? 'lamp' : 'statue');
    return door;
  }
}
