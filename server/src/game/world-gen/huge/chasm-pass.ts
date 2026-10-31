// Local Imports
import {
  CREVASSE_CLEARANCE,
  CREVASSE_SCALE,
  CREVASSE_WIDTH,
  RING_MIN,
  RING_WOBBLE,
  SINKHOLES,
  SITE_EDGE,
} from '../config/huge';
import { GenPass } from '../gen-pass';
import { noise } from '../helpers/noise';
import { siteAt } from '../helpers/sites';

// Types
import type { Site } from '../types/sites';

/**
 * The chasms of a huge world: the ring around it, the crevasses, and the
 * sinkholes.
 */
export class ChasmPass extends GenPass {
  /**
   * A ring of chasm around the map, crevasses winding through the wilds
   * where a noise field crosses its middle, and SINKHOLES round pits, the
   * last two kept CREVASSE_CLEARANCE tiles from any site's pad. The
   * ground keeps its level under the chasm until the end, so roads
   * bridging it know how high to go.
   * @param sites Every site.
   */
  chasms(sites: Site[]): void {
    const near = (x: number, y: number): boolean => siteAt(sites, x, y, CREVASSE_CLEARANCE) !== undefined;
    const wobble = noise(this._canvas.rand, 14);
    const crevasse = noise(this._canvas.rand, CREVASSE_SCALE);
    const n = this.map.width;
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const edge = Math.min(x, y, n - 1 - x, n - 1 - y);
        const ring = RING_MIN + Math.floor(wobble(x, y) * RING_WOBBLE);
        if (edge < ring) {
          this.map.set(x, y, 'chasm');
        } else if (Math.abs(crevasse(x, y) - 0.5) < CREVASSE_WIDTH && edge > ring + 2 && !near(x, y)) {
          this.map.set(x, y, 'chasm');
        }
      }
    }
    for (let i = 0; i < SINKHOLES; i++) {
      const cx = SITE_EDGE + this.rand() * (n - 2 * SITE_EDGE);
      const cy = SITE_EDGE + this.rand() * (n - 2 * SITE_EDGE);
      const r = 2 + this.rand() * 3;
      for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) {
        for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
          if (Math.hypot(x - cx, y - cy) <= r && !near(x, y)) {
            this.map.set(x, y, 'chasm');
          }
        }
      }
    }
  }
}
