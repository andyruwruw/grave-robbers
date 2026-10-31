// Packages
import { MAP_HEIGHT, MAP_WIDTH } from '@halloween/shared/world/dimensions';

// Local Imports
import { CRYPT } from '../../config/classic';
import { ClassicPass } from '../classic-pass';

// Types
import type { Rect } from '../../types/geometry';

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
   * @param at The crypt's walls (the middle of a classic map by default).
   */
  crypt(at: Rect = CRYPT): void {
    const cx = at.x + Math.floor(at.w / 2);
    const cy = at.y + Math.floor(at.h / 2);
    this.fill({ x: at.x - 1, y: at.y - 1, w: at.w + 2, h: at.h + 2 }, 'cobble');
    this.reserved.push({ x: at.x - 2, y: at.y - 2, w: at.w + 4, h: at.h + 4 });
    for (let ty = at.y; ty < at.y + at.h; ty++) {
      for (let tx = at.x; tx < at.x + at.w; tx++) {
        const wall = tx === at.x || tx === at.x + at.w - 1 || ty === at.y || ty === at.y + at.h - 1;
        const horizontalWall = ty === at.y || ty === at.y + at.h - 1;
        const door = horizontalWall ? tx === cx - 1 || tx === cx : ty === cy - 1 || ty === cy;
        this.map.set(tx, ty, wall && !door ? 'crypt' : 'flagstone');
      }
    }
  }
}
