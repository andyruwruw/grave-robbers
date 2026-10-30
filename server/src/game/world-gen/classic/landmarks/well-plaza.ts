// Local Imports
import { CourtyardLandmark } from './courtyard-landmark';

// Types
import type { Point, Rect } from '../../types/geometry';

/**
 * The well plaza landmark.
 */
export class WellPlaza extends CourtyardLandmark {
  /**
   * A round cobbled plaza with a well in the middle, a statue, and lamps
   * on either side.
   * @param r The footprint.
   * @returns Its entrance.
   */
  protected build(r: Rect): Point {
    this.disk(r, 'cobble');
    const c = Math.floor(r.w / 2);
    const off = Math.max(1, Math.floor(((r.w - 1) / 2) * 0.7));
    this.map.set(r.x + c, r.y + c, 'well');
    this.map.set(r.x + c - off, r.y + c - off, 'lamp');
    this.map.set(r.x + c + off, r.y + c + off, 'lamp');
    this.map.set(r.x + c + off, r.y + c - off, 'statue');
    return this.doorTowardCenter(r);
  }
}
