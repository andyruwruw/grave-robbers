// Packages
import { BLOATER_BURST } from '@halloween/shared/monsters/kinds/bloater';
import { MONSTERS } from '@halloween/shared/monsters/monster-stats';

// Local Imports
import { HordePart } from './horde-part';

// Types
import type { World } from '../world/world';
import type { Target } from './types/hooks';
import type { Burst } from './types/monster';

/**
 * Bloaters bursting: each one that died since the last step hurts and
 * throws the players around it, hits every monster in reach (which may
 * set off another bloater, bursting a step later), and leaves bile.
 */
export class Bursts<P extends Target> extends HordePart<P> {
  /**
   * Bursts every bloater that died since the last step.
   * @param world The world.
   * @param prey Players monsters may go after.
   */
  update(world: World, prey: P[]): void {
    const due = this._horde.bursts.splice(0);
    for (const b of due) {
      this.burst(b, world, prey);
    }
  }

  /**
   * One bloater bursts.
   * @param b The burst.
   * @param world The world.
   * @param prey Players monsters may go after.
   */
  private burst(b: Burst, world: World, prey: P[]): void {
    const by = MONSTERS.bloater.label;
    this.hooks.event({ t: 'burst', x: b.x, y: b.y });
    this.hooks.spill(b.x, b.y, by);
    for (const p of prey) {
      if (Math.hypot(p.x - b.x, p.y - b.y) <= BLOATER_BURST.radius) {
        this.hooks.hurt(p, BLOATER_BURST.damage * b.power, by, b.x, b.y, BLOATER_BURST.knockback);
      }
    }
    for (const m of [...this.roster.values()]) {
      if (m.hasBody && Math.hypot(m.x - b.x, m.y - b.y) <= BLOATER_BURST.radius) {
        m.takeHit(BLOATER_BURST.monsters, b.x, b.y, world, BLOATER_BURST.knockback, {});
      }
    }
  }
}
