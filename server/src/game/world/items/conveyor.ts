// Packages
import { BELT_SPEED } from '@halloween/shared/structures/automation';

// Local Imports
import { WorldFeature } from '../world-feature';

/**
 * Conveyor belts moving what lies on them.
 */
export class Conveyor extends WorldFeature {
  /**
   * Conveyor belts carry everything lying on them along the way they were
   * laid, centering it on the belt. What reaches a belt's end runs off
   * onto open floor, or waits at the edge of anything solid (where a
   * station takes it in).
   * @param dt Seconds since the last step.
   */
  convey(dt: number): void {
    for (const item of this.items.values()) {
      const tx = Math.floor(item.x);
      const ty = Math.floor(item.y);
      const turn = this.map.get(tx, ty) === 'belt' ? this.map.turnOf(tx, ty) : null;
      if (!turn) {
        continue;
      }
      const [dx, dy] = turn;
      const step = BELT_SPEED * dt;
      const center = (v: number, t: number): number => v + Math.max(-step, Math.min(step, t + 0.5 - v));
      let x = dx === 0 ? center(item.x, tx) : item.x + dx * step;
      let y = dy === 0 ? center(item.y, ty) : item.y + dy * step;
      const nx = Math.floor(x);
      const ny = Math.floor(y);
      if ((nx !== tx || ny !== ty) && this.map.isSolid(nx, ny)) {
        x = dx === 0 ? x : tx + 0.5 + dx * 0.45;
        y = dy === 0 ? y : ty + 0.5 + dy * 0.45;
      }
      item.x = x;
      item.y = y;
    }
  }
}
