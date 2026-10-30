// Local Imports
import { TOWER_SIZE } from '../../config/classic';
import { Landmark } from './landmark';

// Types
import type { Tile } from '@halloween/shared/world/tiles';
import type { Point, Rect } from '../../types/geometry';

/**
 * The hill landmark: a raised 9x7 block with stairs and a watchtower.
 */
export class Hill extends Landmark {
  /**
   * Tries the hill at a few spots in a quadrant.
   * @param q The quadrant.
   * @returns Whether it fit.
   */
  tryIn(q: Rect): boolean {
    return this.place(q, 9, 7, (r: Rect) => this.hill(r));
  }

  /**
   * A hill a level up with lamp posts on its corners, stairs up the side
   * facing the center and the opposite side, and a watchtower on top.
   * @param r The footprint.
   * @returns Its entrance.
   */
  private hill(r: Rect): Point {
    for (let ty = r.y; ty < r.y + r.h; ty++) {
      for (let tx = r.x; tx < r.x + r.w; tx++) {
        this.map.setLevel(tx, ty, 1);
      }
    }
    for (const [px, py] of this.perimeter(r)) {
      if (this.isCorner(r, px, py)) {
        this.map.set(px, py, 'lamp');
      }
    }
    const door = this.doorTowardCenter(r);
    for (const [sx, sy] of [door, this.oppositeSide(r, door)]) {
      for (const [dx, dy] of sy === r.y || sy === r.y + r.h - 1 ? [[0, 0], [1, 0]] : [[0, 0], [0, 1]]) {
        this.map.set(sx + dx, sy + dy, 'stairs');
        this.map.setLevel(sx + dx, sy + dy, 0);
      }
    }
    this.tower({ x: r.x + Math.floor((r.w - TOWER_SIZE) / 2), y: r.y + Math.floor((r.h - TOWER_SIZE) / 2), w: TOWER_SIZE, h: TOWER_SIZE });
    return door;
  }

  /**
   * A stone watchtower: walls around a 3x3 room with a pillar in the
   * middle, a doorway toward the map center, and stairs spiraling up
   * around the pillar from the door: past a corner to a step up to the
   * next corner, another step up to the top floor, which runs the rest of
   * the way round. Steps sit mid-side so each has a corner landing below
   * it, never a wall.
   * @param r The footprint (walls included).
   */
  private tower(r: Rect): void {
    this.fill(r, 'tower');
    const base = this.map.level(r.x, r.y);
    const ring: Point[] = [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2], [1, 2], [0, 2], [0, 1]];
    const [doorX, doorY] = this.doorTowardCenter(r);
    const inside: Point = [Math.min(r.x + 3, Math.max(r.x + 1, doorX)), Math.min(r.y + 3, Math.max(r.y + 1, doorY))];
    const start = ring.findIndex(([ix, iy]): boolean => r.x + 1 + ix === inside[0] && r.y + 1 + iy === inside[1]);
    const floors: [Tile, number][] = [
      ['flagstone', 0], ['flagstone', 0], ['stairs', 0], ['flagstone', 1],
      ['stairs', 1], ['flagstone', 2], ['flagstone', 2], ['flagstone', 2],
    ];
    floors.forEach(([tile, up]: [Tile, number], i: number): void => {
      const [ix, iy] = ring[(start + i) % ring.length];
      this.map.set(r.x + 1 + ix, r.y + 1 + iy, tile);
      this.map.setLevel(r.x + 1 + ix, r.y + 1 + iy, base + up);
    });
    this.map.set(doorX, doorY, 'flagstone');
  }

  /**
   * The point on the rectangle's far side from a point on its edge.
   * @param r The rectangle.
   * @param point A point on its edge.
   * @returns The point straight across.
   */
  private oppositeSide(r: Rect, [px, py]: Point): Point {
    if (px === r.x || px === r.x + r.w - 1) {
      return [px === r.x ? r.x + r.w - 1 : r.x, py];
    }
    return [px, py === r.y ? r.y + r.h - 1 : r.y];
  }
}
