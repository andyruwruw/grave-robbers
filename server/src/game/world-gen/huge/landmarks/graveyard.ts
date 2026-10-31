// Local Imports
import { Landmark } from '../../classic/landmarks/landmark';
import { PlotPass } from '../../classic/passes/plot-pass';

// Types
import type { Rect } from '../../types/geometry';

/**
 * A graveyard site: a cluster of hedged grave plots.
 */
export class Graveyard extends Landmark {
  /**
   * Two to four hedged grave plots dotted around the site, each with a
   * path from a gap in its hedge to the road.
   * @param q Where they may go.
   * @returns Whether any fit.
   */
  tryIn(q: Rect): boolean {
    const plots = new PlotPass(this._canvas);
    const count = 2 + Math.floor(this.rand() * 3);
    let built = 0;
    for (let i = 0; i < count; i++) {
      built += this.place(q, 5 + Math.floor(this.rand() * 4), 4 + Math.floor(this.rand() * 3), (r: Rect) => plots.plot(r)) ? 1 : 0;
    }
    return built > 0;
  }
}
