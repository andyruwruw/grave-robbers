// Packages
import { MAP_HEIGHT, MAP_WIDTH } from '@halloween/shared/world/dimensions';

// Local Imports
import { CENTER_X, CENTER_Y, CRYPT } from '../../config/classic';
import { ClassicPass } from '../classic-pass';

/**
 * The fence around the map and the crypt at its middle.
 */
export class CryptPass extends ClassicPass {
  /**
   * Rings the map with fence.
   */
  border(): void {
    for (let ty = 0; ty < MAP_HEIGHT; ty++) {
      for (let tx = 0; tx < MAP_WIDTH; tx++) {
        if (this.edge(tx, ty) === 0) {
          this.map.set(tx, ty, 'fence');
        }
      }
    }
  }

  /**
   * The crypt, with a 2-wide doorway on every side, in a one-tile cobbled
   * courtyard. Each doorway lines up with a main path.
   */
  crypt(): void {
    this.fill({ x: CRYPT.x - 1, y: CRYPT.y - 1, w: CRYPT.w + 2, h: CRYPT.h + 2 }, 'cobble');
    this.reserved.push({ x: CRYPT.x - 2, y: CRYPT.y - 2, w: CRYPT.w + 4, h: CRYPT.h + 4 });
    for (let ty = CRYPT.y; ty < CRYPT.y + CRYPT.h; ty++) {
      for (let tx = CRYPT.x; tx < CRYPT.x + CRYPT.w; tx++) {
        const wall = tx === CRYPT.x || tx === CRYPT.x + CRYPT.w - 1 || ty === CRYPT.y || ty === CRYPT.y + CRYPT.h - 1;
        const horizontalWall = ty === CRYPT.y || ty === CRYPT.y + CRYPT.h - 1;
        const door = horizontalWall ? tx === CENTER_X - 1 || tx === CENTER_X : ty === CENTER_Y - 1 || ty === CENTER_Y;
        this.map.set(tx, ty, wall && !door ? 'crypt' : 'flagstone');
      }
    }
  }
}
