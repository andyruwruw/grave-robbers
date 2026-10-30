// Local Imports
import {
  CREVASSE_CLEARANCE,
  CREVASSE_SCALE,
  CREVASSE_WIDTH,
  DISTRICT_EDGE,
  RING_MIN,
  RING_WOBBLE,
  SINKHOLES,
} from '../config/huge';
import { GenPass } from '../gen-pass';
import { noise } from '../helpers/noise';

/**
 * The chasms of a huge world: the ring around it, the crevasses, and the
 * sinkholes.
 */
export class ChasmPass extends GenPass {
  /**
   * A ring of chasm around the map, crevasses winding through the wilds
   * where a noise field crosses its middle, and SINKHOLES round pits, the
   * last two kept CREVASSE_CLEARANCE tiles from any district.
   * @param inDistrict Whether a tile is within `margin` of a district.
   */
  chasms(inDistrict: (x: number, y: number, margin?: number) => boolean): void {
    const wobble = noise(this._canvas.rand, 14);
    const crevasse = noise(this._canvas.rand, CREVASSE_SCALE);
    const n = this.map.width;
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const edge = Math.min(x, y, n - 1 - x, n - 1 - y);
        const ring = RING_MIN + Math.floor(wobble(x, y) * RING_WOBBLE);
        if (edge < ring) {
          this.map.set(x, y, 'chasm');
        } else if (Math.abs(crevasse(x, y) - 0.5) < CREVASSE_WIDTH && edge > ring + 2 && !inDistrict(x, y, CREVASSE_CLEARANCE)) {
          this.map.set(x, y, 'chasm');
        }
      }
    }
    for (let i = 0; i < SINKHOLES; i++) {
      const cx = DISTRICT_EDGE + this.rand() * (n - 2 * DISTRICT_EDGE);
      const cy = DISTRICT_EDGE + this.rand() * (n - 2 * DISTRICT_EDGE);
      const r = 2 + this.rand() * 3;
      for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
        for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
          if (Math.hypot(x - cx, y - cy) <= r && !inDistrict(x, y, CREVASSE_CLEARANCE)) {
            this.map.set(x, y, 'chasm');
          }
        }
      }
    }
  }
}
