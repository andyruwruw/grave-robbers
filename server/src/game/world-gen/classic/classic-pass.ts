// Packages
import { MAP_HEIGHT, MAP_WIDTH } from '@halloween/shared/world/dimensions';

// Local Imports
import { OPEN } from '../config/classic';
import { GenPass } from '../gen-pass';

// Types
import type { Tile } from '@halloween/shared/world/tiles';
import type { Point, Rect } from '../types/geometry';

/**
 * A classic (one graveyard) generation step: the canvas plus the small
 * tile helpers the steps share.
 */
export abstract class ClassicPass extends GenPass {
  /**
   * Rectangles already claimed (the crypt, each landmark), which terraces
   * stay off.
   * @returns The canvas's list.
   */
  protected get reserved(): Rect[] {
    return this._canvas.reserved;
  }

  /**
   * Whether a rectangle is all open ground at least two tiles in from the
   * fence.
   * @param r The rectangle.
   * @returns Whether it is.
   */
  protected isOpen(r: Rect): boolean {
    for (let ty = r.y; ty < r.y + r.h; ty++) {
      for (let tx = r.x; tx < r.x + r.w; tx++) {
        if (!OPEN.has(this.map.get(tx, ty)) || this.edge(tx, ty) < 2) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Sets every tile in a rectangle.
   * @param r The rectangle.
   * @param tile What to set.
   */
  protected fill(r: Rect, tile: Tile): void {
    for (let ty = r.y; ty < r.y + r.h; ty++) {
      for (let tx = r.x; tx < r.x + r.w; tx++) {
        this.map.set(tx, ty, tile);
      }
    }
  }

  /**
   * Every tile on a rectangle's edge, clockwise from its top-left corner.
   * @param r The rectangle.
   * @returns The tiles.
   */
  protected perimeter(r: Rect): Point[] {
    const points: Point[] = [];
    for (let tx = r.x; tx < r.x + r.w; tx++) {
      points.push([tx, r.y]);
    }
    for (let ty = r.y + 1; ty < r.y + r.h; ty++) {
      points.push([r.x + r.w - 1, ty]);
    }
    for (let tx = r.x + r.w - 2; tx >= r.x; tx--) {
      points.push([tx, r.y + r.h - 1]);
    }
    for (let ty = r.y + r.h - 2; ty > r.y; ty--) {
      points.push([r.x, ty]);
    }
    return points;
  }

  /**
   * Whether a tile is one of a rectangle's corners.
   * @param r The rectangle.
   * @param x The tile's column.
   * @param y The tile's row.
   * @returns Whether it is.
   */
  protected isCorner(r: Rect, x: number, y: number): boolean {
    return (x === r.x || x === r.x + r.w - 1) && (y === r.y || y === r.y + r.h - 1);
  }

  /**
   * How far a tile is from the map's edge.
   * @param tx The tile's column.
   * @param ty The tile's row.
   * @returns The distance in tiles (0 on the fence).
   */
  protected edge(tx: number, ty: number): number {
    return Math.min(tx, ty, MAP_WIDTH - 1 - tx, MAP_HEIGHT - 1 - ty);
  }

  /**
   * Shuffles a list in place (Fisher-Yates on the map's PRNG).
   * @param list The list.
   * @returns The same list.
   */
  protected shuffle<T>(list: T[]): T[] {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(this.rand() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }
}
