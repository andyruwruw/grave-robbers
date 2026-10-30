// Packages
import { HUGE_SIZE } from '@halloween/shared/world/dimensions';

// Local Imports
import { ROAD_REACH } from '../config/huge';
import { GenPass } from '../gen-pass';
import { inside } from '../helpers/rect';

// Types
import type { Rect } from '../types/geometry';

/**
 * The roads joining a huge world's districts.
 */
export class RoadPass extends GenPass {
  /**
   * Joins the districts with winding 2-wide dirt roads along a minimum
   * spanning tree of their centers, each from the side of one district
   * facing the other. A road levels and clears whatever wild ground it
   * crosses (bridging chasms), and cuts ROAD_REACH tiles into a district's
   * woods to meet it.
   * @param districts Every district's footprint.
   */
  roads(districts: Rect[]): void {
    const center = (r: Rect): [number, number] => [r.x + r.w / 2, r.y + r.h / 2];
    const linked = new Set([0]);
    while (linked.size < districts.length) {
      let best: [number, number, number] | null = null;
      for (const a of linked) {
        districts.forEach((_r: Rect, b: number): void => {
          if (linked.has(b)) {
            return;
          }
          const [ax, ay] = center(districts[a]);
          const [bx, by] = center(districts[b]);
          const d = Math.hypot(ax - bx, ay - by);
          if (!best || d < best[2]) {
            best = [a, b, d];
          }
        });
      }
      const [a, b] = best!;
      linked.add(b);
      this.road(districts, districts[a], districts[b]);
    }
  }

  /**
   * One winding road between two districts, from the side of each facing
   * the other.
   * @param districts Every district's footprint.
   * @param from The district it starts at.
   * @param to The district it ends at.
   */
  private road(districts: Rect[], from: Rect, to: Rect): void {
    const side = (r: Rect, toward: Rect): [number, number] => {
      const [cx, cy] = [r.x + r.w / 2, r.y + r.h / 2];
      const [tx, ty] = [toward.x + toward.w / 2, toward.y + toward.h / 2];
      return Math.abs(tx - cx) * r.h > Math.abs(ty - cy) * r.w
        ? [tx > cx ? r.x + r.w - 1 : r.x, Math.floor(cy)]
        : [Math.floor(cx), ty > cy ? r.y + r.h - 1 : r.y];
    };
    let [x, y] = side(from, to);
    const [ex, ey] = side(to, from);
    const lay = (px: number, py: number): void => {
      for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
        const qx = px + dx;
        const qy = py + dy;
        const home = districts.find((r: Rect): boolean => inside(r, qx, qy));
        const edgeDepth = home ? Math.min(qx - home.x, qy - home.y, home.x + home.w - 1 - qx, home.y + home.h - 1 - qy) : 0;
        const tile = this.map.get(qx, qy);
        if (!home || (edgeDepth < ROAD_REACH && (tile === 'tree' || tile === 'rock' || tile === 'hedge' || tile === 'grass' || tile === 'stump') && this.map.level(qx, qy) === 0)) {
          this.map.set(qx, qy, 'path');
          this.map.setLevel(qx, qy, 0);
        }
      }
    };
    for (let guard = 0; guard < HUGE_SIZE * 4 && (x !== ex || y !== ey); guard++) {
      lay(x, y);
      const horizontal = x !== ex && (y === ey || this.rand() < Math.abs(ex - x) / (Math.abs(ex - x) + Math.abs(ey - y)) * 0.8 + 0.1);
      if (horizontal) {
        x += Math.sign(ex - x);
      } else {
        y += Math.sign(ey - y);
      }
    }
    lay(x, y);
  }
}
