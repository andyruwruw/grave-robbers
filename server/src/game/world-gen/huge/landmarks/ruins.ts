// Local Imports
import { Landmark } from '../../classic/landmarks/landmark';

// Types
import type { Point, Rect } from '../../types/geometry';

/**
 * A ruins site: the broken shells of a few small stone houses.
 */
export class Ruins extends Landmark {
  /**
   * Two to four ruined houses dotted around the site.
   * @param q Where they may go.
   * @returns Whether any fit.
   */
  tryIn(q: Rect): boolean {
    const count = 2 + Math.floor(this.rand() * 3);
    let built = 0;
    for (let i = 0; i < count; i++) {
      built += this.place(q, 4 + Math.floor(this.rand() * 3), 4 + Math.floor(this.rand() * 2), (r: Rect) => this.house(r)) ? 1 : 0;
    }
    return built > 0;
  }

  /**
   * One ruined house: broken walls with a doorway toward the site's
   * middle, a flagstone floor, and sometimes a chest or rubble inside.
   * @param r The footprint, walls included.
   * @returns Its doorway.
   */
  private house(r: Rect): Point {
    const door = this.doorTowardCenter(r);
    const walls = this.perimeter(r);
    const broken = new Set(Array.from({ length: 1 + Math.floor(this.rand() * 3) }, (): number => Math.floor(this.rand() * walls.length)));
    walls.forEach(([px, py]: Point, i: number): void => {
      const isDoor = px === door[0] && py === door[1];
      this.map.set(px, py, isDoor || (broken.has(i) && !this.isCorner(r, px, py)) ? 'flagstone' : 'ruin');
    });
    this.fill({ x: r.x + 1, y: r.y + 1, w: r.w - 2, h: r.h - 2 }, 'flagstone');
    const roll = this.rand();
    if (roll < 0.5) {
      const inside: Point = [r.x + 1 + Math.floor(this.rand() * (r.w - 2)), r.y + 1 + Math.floor(this.rand() * (r.h - 2))];
      const nextToDoor = Math.abs(inside[0] - door[0]) + Math.abs(inside[1] - door[1]) <= 1;
      if (!nextToDoor) {
        this.map.set(...inside, roll < 0.25 ? 'chest' : 'rock');
      }
    }
    return door;
  }
}
