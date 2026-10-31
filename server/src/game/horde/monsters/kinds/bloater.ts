// Local Imports
import { Shambler } from '../shambler';

// Types
import type { World } from '../../../world/world';
import type { Target } from '../../types/hooks';

/**
 * A bloater: a swollen zombie that shuffles up to its prey, swells, and
 * bursts (see `Bursts`). It bursts however it dies, so killing one in the
 * middle of the horde clears room; a stagger breaks off the swelling.
 */
export class Bloater<P extends Target> extends Shambler<P> {
  /**
   * Its strike: it bursts where it stands.
   * @param target Who it was aimed at.
   * @param prey Players monsters may go after.
   * @param world The world.
   */
  protected release(target: P | null, prey: P[], world: World): void {
    if (this._ctx.roster.has(this.id)) {
      this._ctx.kill(this, this.facing);
    }
  }

  /**
   * Queues its burst for the horde's next step.
   */
  dying(): void {
    this._ctx.bursts.push({ x: this.x, y: this.y, power: this.power });
  }
}
