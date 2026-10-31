// Local Imports
import { HUB_ARM } from '../config/huge';
import { CryptPass } from '../classic/passes/crypt-pass';
import { LampPass } from '../classic/passes/lamp-pass';
import { PathPass } from '../classic/passes/path-pass';
import { PlotPass } from '../classic/passes/plot-pass';
import { GenPass } from '../gen-pass';

// Types
import type { Point } from '../types/geometry';
import type { Site } from '../types/sites';

/**
 * The hub at a huge world's middle, where everyone starts.
 */
export class HubPass extends GenPass {
  /**
   * The crypt in its cobbled courtyard, four 2-wide cobbled arms HUB_ARM
   * tiles out from its doors with two spawns on each (and lamp posts
   * beside them when lamps are on), and hedged grave plots between them.
   * The arms' ends are the hub's gates, where roads begin.
   * @param hub The hub site.
   * @returns The spawn tiles.
   */
  hub(hub: Site): Point[] {
    const cx = Math.floor(hub.x);
    const cy = Math.floor(hub.y);
    const crypt = { x: cx - 4, y: cy - 3, w: 8, h: 6 };
    new CryptPass(this._canvas).crypt(crypt);
    const starts: [Point, Point][] = [
      [[cx - 1, crypt.y - 2], [0, -1]],
      [[cx - 1, crypt.y + crypt.h + 1], [0, 1]],
      [[crypt.x - 2, cy - 1], [-1, 0]],
      [[crypt.x + crypt.w + 1, cy - 1], [1, 0]],
    ];
    const arms = starts.map(([[x, y], [dx, dy]]): Point[] => Array.from({ length: HUB_ARM }, (_: unknown, i: number): Point => [x + dx * i, y + dy * i]));
    for (const arm of arms) {
      for (const [x, y] of arm) {
        for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
          if (this.map.get(x + dx, y + dy) === 'grass') {
            this.map.set(x + dx, y + dy, 'cobble');
          }
        }
      }
    }
    hub.gates = arms.map((arm: Point[]): Point => arm[arm.length - 1]);
    const spawns = new PathPass(this._canvas).spawns(arms);
    if (this.gen.structures.lamps) {
      new LampPass(this._canvas).lamps(arms);
    }
    if (this.gen.structures.plots) {
      const r = Math.floor(hub.radius * 0.7);
      new PlotPass(this._canvas).plots({ x: cx - r, y: cy - r, w: r * 2, h: r * 2 }, 40);
    }
    return spawns;
  }
}
