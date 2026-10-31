// Local Imports
import { Landmark } from '../../classic/landmarks/landmark';

// Types
import type { Point, Rect } from '../../types/geometry';

/**
 * A pumpkin patch site: rows of pumpkins inside a hedge.
 */
export class PumpkinPatch extends Landmark {
  /**
   * Tries the patch at a few spots.
   * @param q Where it may go.
   * @returns Whether it fit.
   */
  tryIn(q: Rect): boolean {
    return this.place(q, 7 + Math.floor(this.rand() * 3), 6 + Math.floor(this.rand() * 2), (r: Rect) => this.patch(r));
  }

  /**
   * A hedge with a gate toward the road and a gap or two, around rows of
   * pumpkins (the pumpkins knob thins them) between dirt furrows, kept
   * clear just inside the gate.
   * @param r The footprint, hedge included.
   * @returns Its gate.
   */
  private patch(r: Rect): Point {
    const gate = this.doorTowardCenter(r);
    for (const [px, py] of this.perimeter(r)) {
      const isGate = px === gate[0] && py === gate[1];
      this.map.set(px, py, isGate || (this.rand() < 0.08 && !this.isCorner(r, px, py)) ? 'path' : 'hedge');
    }
    for (let ty = r.y + 1; ty < r.y + r.h - 1; ty++) {
      for (let tx = r.x + 1; tx < r.x + r.w - 1; tx++) {
        const row = (ty - r.y) % 2 === 1;
        const byGate = Math.abs(tx - gate[0]) + Math.abs(ty - gate[1]) <= 1;
        this.map.set(tx, ty, row && !byGate && this.rand() < Math.min(1, 0.7 * this.gen.pumpkins) ? 'pumpkin' : 'path');
      }
    }
    return gate;
  }
}
