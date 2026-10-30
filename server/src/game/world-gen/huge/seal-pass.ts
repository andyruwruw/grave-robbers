// Local Imports
import { GenPass } from '../gen-pass';
import { inside } from '../helpers/rect';

// Types
import type { Rect } from '../types/geometry';

/**
 * Closes off a huge world's unreachable ground.
 */
export class SealPass extends GenPass {
  /**
   * Wild ground that can't be reached from the spawn and back falls away
   * into chasm; district ground that can't becomes trees.
   * @param districts Every district's footprint.
   */
  seal(districts: Rect[]): void {
    const ok = this.map.roundTrip(this.map.spawnPoints());
    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        if (this.map.isSolid(x, y) || ok[this.map.index(x, y)]) {
          continue;
        }
        this.map.set(x, y, districts.some((r: Rect): boolean => inside(r, x, y)) ? 'tree' : 'chasm');
      }
    }
  }
}
