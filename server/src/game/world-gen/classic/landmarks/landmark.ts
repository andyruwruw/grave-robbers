// Packages
import { MAP_WIDTH } from '@halloween/shared/world/dimensions';

// Local Imports
import { CENTER_X, CENTER_Y, DIRS } from '../../config/classic';
import { ClassicPass } from '../classic-pass';

// Types
import type { Point, Rect } from '../../types/geometry';

/**
 * A landmark one quadrant gets: something built on a footprint that fits
 * on open ground, with a path from its entrance to the nearest path.
 */
export abstract class Landmark extends ClassicPass {
  /**
   * Tries to build the landmark somewhere in a quadrant.
   * @param q The quadrant.
   * @returns Whether it fit.
   */
  abstract tryIn(q: Rect): boolean;

  /**
   * Tries a w x h footprint at random spots in a quadrant; builds it at the
   * first all-open spot and links its entrance to the nearest path.
   * @param q The quadrant.
   * @param w The footprint's width.
   * @param h The footprint's height.
   * @param build Builds on the footprint and returns its entrance.
   * @returns Whether it fit.
   */
  protected place(q: Rect, w: number, h: number, build: (r: Rect) => Point): boolean {
    for (let tries = 0; tries < 40; tries++) {
      const r = {
        x: q.x + Math.floor(this.rand() * Math.max(1, q.w - w)),
        y: q.y + Math.floor(this.rand() * Math.max(1, q.h - h)),
        w,
        h,
      };
      if (this.isOpen({ x: r.x - 1, y: r.y - 1, w: r.w + 2, h: r.h + 2 })) {
        this.reserved.push({ x: r.x - 1, y: r.y - 1, w: r.w + 2, h: r.h + 2 });
        this.linkToPath(build(r), r);
        return true;
      }
    }
    return false;
  }

  /**
   * Carves a 1-wide dirt path from an entrance to the nearest path tile
   * outside the landmark itself, only through grass.
   * @param from The entrance.
   * @param own The landmark's footprint.
   */
  private linkToPath([fx, fy]: Point, own: Rect): void {
    const inside = (x: number, y: number): boolean => x >= own.x && x < own.x + own.w && y >= own.y && y < own.y + own.h;
    const prev = new Map<number, number>();
    const start = fy * MAP_WIDTH + fx;
    prev.set(start, -1);
    const queue = [start];
    let goal = -1;
    while (queue.length > 0 && goal < 0) {
      const i = queue.shift()!;
      for (const [dx, dy] of DIRS) {
        const nx = (i % MAP_WIDTH) + dx;
        const ny = Math.floor(i / MAP_WIDTH) + dy;
        const ni = ny * MAP_WIDTH + nx;
        const tile = this.map.get(nx, ny);
        if (prev.has(ni)) {
          continue;
        }
        if ((tile === 'path' || tile === 'cobble') && !inside(nx, ny)) {
          prev.set(ni, i);
          goal = i;
          break;
        }
        if (tile === 'grass' || inside(nx, ny) && !this.map.isSolid(nx, ny)) {
          prev.set(ni, i);
          queue.push(ni);
        }
      }
    }
    for (let i = goal; i >= 0 && i !== start; i = prev.get(i)!) {
      if (this.map.get(i % MAP_WIDTH, Math.floor(i / MAP_WIDTH)) === 'grass') {
        this.map.set(i % MAP_WIDTH, Math.floor(i / MAP_WIDTH), 'path');
      }
    }
  }

  /**
   * The middle of the rectangle's side that faces the map center.
   * @param r The rectangle.
   * @returns That tile.
   */
  protected doorTowardCenter(r: Rect): Point {
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2;
    const dx = CENTER_X - cx;
    const dy = CENTER_Y - cy;
    if (Math.abs(dx) / r.w > Math.abs(dy) / r.h) {
      return [dx > 0 ? r.x + r.w - 1 : r.x, r.y + Math.floor(r.h / 2)];
    }
    return [r.x + Math.floor(r.w / 2), dy > 0 ? r.y + r.h - 1 : r.y];
  }
}
