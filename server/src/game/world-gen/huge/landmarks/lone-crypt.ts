// Local Imports
import { Landmark } from '../../classic/landmarks/landmark';
import { CryptPass } from '../../classic/passes/crypt-pass';

// Types
import type { Point, Rect } from '../../types/geometry';

/**
 * A crypt site: a crypt like the hub's, with no spawns, out in the wilds.
 */
export class LoneCrypt extends Landmark {
  /**
   * Tries the crypt and its courtyard at a few spots.
   * @param q Where it may go.
   * @returns Whether it fit.
   */
  tryIn(q: Rect): boolean {
    return this.place(q, 10, 8, (r: Rect) => this.crypt(r));
  }

  /**
   * The crypt in its cobbled courtyard, with statues (or lamp posts, when
   * lamps are on) on two corners.
   * @param r The courtyard.
   * @returns Its entrance.
   */
  private crypt(r: Rect): Point {
    new CryptPass(this._canvas).crypt({ x: r.x + 1, y: r.y + 1, w: r.w - 2, h: r.h - 2 });
    const corner = this.gen.structures.lamps ? 'lamp' : 'statue';
    this.map.set(r.x, r.y, corner);
    this.map.set(r.x + r.w - 1, r.y + r.h - 1, corner);
    return this.doorTowardCenter(r);
  }
}
