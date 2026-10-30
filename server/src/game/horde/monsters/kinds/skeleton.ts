// Packages
import { ARROW_SPEED } from '@halloween/shared/monsters/kinds/skeleton';

// Local Imports
import { Kiter } from '../kiter';

// Types
import type { World } from '../../../world/world';
import type { Target } from '../../types/hooks';

/**
 * A skeleton archer: keeps its distance and shoots arrows.
 */
export class Skeleton<P extends Target> extends Kiter<P> {
  /**
   * Its strike: an arrow flies along its aim.
   * @param target Who it was aimed at.
   * @param prey Players monsters may go after.
   * @param world The world.
   */
  protected release(target: P | null, prey: P[], world: World): void {
    const def = this.def;
    this._ctx.hooks.shoot(this.x, this.y, this.facing, { kind: 'arrow', damage: this.blow(), speed: ARROW_SPEED, reach: def.range! + 1.5, by: def.label });
  }
}
