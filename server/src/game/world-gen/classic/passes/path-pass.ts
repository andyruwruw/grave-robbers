// Packages
import { MAP_HEIGHT, MAP_WIDTH } from '@halloween/shared/world/dimensions';

// Local Imports
import { CENTER_X, CENTER_Y, COBBLE_RADIUS, CRYPT } from '../../config/classic';
import { ClassicPass } from '../classic-pass';

// Types
import type { Tile } from '@halloween/shared/world/tiles';
import type { Point } from '../../types/geometry';

/**
 * The four winding main paths out from the crypt and the spawns on them.
 */
export class PathPass extends ClassicPass {
  /**
   * Four 2-wide paths that wander from the courtyard toward each side of
   * the map.
   * @returns Each arm's tiles in order, crypt end first.
   */
  mainPaths(): Point[][] {
    const jitter = (n: number): number => Math.floor((this.rand() - 0.5) * n);
    const arms: [Point, Point][] = [
      [[CENTER_X - 1, CRYPT.y - 2], [CENTER_X - 1 + jitter(10), 2]],
      [[CENTER_X - 1, CRYPT.y + CRYPT.h + 1], [CENTER_X - 1 + jitter(10), MAP_HEIGHT - 3]],
      [[CRYPT.x - 2, CENTER_Y - 1], [2, CENTER_Y - 1 + jitter(8)]],
      [[CRYPT.x + CRYPT.w + 1, CENTER_Y - 1], [MAP_WIDTH - 3, CENTER_Y - 1 + jitter(8)]],
    ];
    return arms.map(([from, to]) => {
      const tiles = this.wander(from, to);
      for (const [x, y] of tiles) {
        const tile: Tile = Math.hypot(x - CENTER_X, y - CENTER_Y) < COBBLE_RADIUS ? 'cobble' : 'path';
        for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
          if (this.map.get(x + dx, y + dy) === 'grass') {
            this.map.set(x + dx, y + dy, tile);
          }
        }
      }
      return tiles;
    });
  }

  /**
   * Two adjacent spawn tiles a little over halfway along each arm.
   * @param arms The main paths, crypt end first.
   * @returns The spawn tiles.
   */
  spawns(arms: Point[][]): Point[] {
    const spawns: Point[] = [];
    for (const arm of arms) {
      const [x, y] = arm[Math.floor(arm.length * 0.6)];
      for (const [sx, sy] of [[x, y], [x + 1, y + 1]] as Point[]) {
        this.map.set(sx, sy, 'spawn');
        spawns.push([sx, sy]);
      }
    }
    return spawns;
  }

  /**
   * Biased random walk from `from` to `to`: mostly straight, with
   * occasional sideways jogs that last a few steps.
   * @param from Where the walk starts.
   * @param to Where it ends.
   * @returns Every tile walked, `from` first.
   */
  private wander([fx, fy]: Point, [tx, ty]: Point): Point[] {
    const tiles: Point[] = [[fx, fy]];
    let x = fx;
    let y = fy;
    let jog: Point = [0, 0];
    let jogLeft = 0;
    for (let guard = 0; (x !== tx || y !== ty) && guard < 800; guard++) {
      const dx = Math.sign(tx - x);
      const dy = Math.sign(ty - y);
      const remaining = Math.abs(tx - x) + Math.abs(ty - y);
      if (jogLeft === 0 && remaining > 5 && this.rand() < 0.12) {
        const sideways = Math.abs(tx - x) > Math.abs(ty - y) ? [0, 1] : [1, 0];
        const s = this.rand() < 0.5 ? -1 : 1;
        jog = [sideways[0] * s, sideways[1] * s];
        jogLeft = 2 + Math.floor(this.rand() * 2);
      }
      let step: Point = Math.abs(tx - x) >= Math.abs(ty - y) ? [dx, 0] : [0, dy];
      if (jogLeft > 0) {
        step = jog;
        jogLeft--;
      }
      const nx = Math.min(MAP_WIDTH - 3, Math.max(1, x + step[0]));
      const ny = Math.min(MAP_HEIGHT - 3, Math.max(1, y + step[1]));
      const blocked = this.map.get(nx, ny) === 'crypt' || this.map.get(nx, ny) === 'flagstone';
      if (blocked) {
        jogLeft = 0;
        continue;
      }
      x = nx;
      y = ny;
      tiles.push([x, y]);
    }
    return tiles;
  }
}
