// Packages
import { POTION_SPEED, WITCH_SWIPE } from '@halloween/shared/monsters/kinds/witch';
import { STRIKE_SLACK } from '@halloween/shared/monsters/monster-stats';

// Local Imports
import { angleOff, distance } from '../../helpers/geometry';
import { Kiter } from '../kiter';

// Types
import type { World } from '../../../world/world';
import type { Target } from '../../types/hooks';

/**
 * A witch: keeps her distance and lobs potions, but swipes her broom at
 * anyone who catches up to her.
 */
export class Witch<P extends Target> extends Kiter<P> {
  /**
   * Whether the attack winding up is a broom swipe.
   */
  swiping = false;

  /**
   * When she may swipe next.
   */
  swipeAt = 0;

  /**
   * Swipes at anyone up close, else keeps her distance and throws.
   * @param p The player.
   * @param dt Seconds since the last tick.
   * @param world The world.
   * @returns True when she took this tick.
   */
  protected engage(p: P, dt: number, world: World): boolean {
    if (distance(this, p) <= WITCH_SWIPE.reach && world.time >= this.swipeAt) {
      this.setHunting(true);
      this.swipe(p, world);
      return true;
    }
    return super.engage(p, dt, world);
  }

  /**
   * A swipe keeps turning toward its prey the whole windup.
   * @param now The game clock.
   * @returns True while she still turns.
   */
  protected tracking(now: number): boolean {
    return this.swiping || super.tracking(now);
  }

  /**
   * Breaks off the attack winding up, swipe or throw.
   */
  protected cancelStrike(): void {
    super.cancelStrike();
    this.swiping = false;
  }

  /**
   * Winds up a swipe of her broom.
   * @param p The player.
   * @param world The world.
   */
  private swipe(p: P, world: World): void {
    this.facing = Math.atan2(p.y - this.y, p.x - this.x);
    this.path = [];
    this.repathAt = 0;
    this.swipeAt = world.time + WITCH_SWIPE.cooldown;
    this.swipes++;
    this.swiping = true;
    this.strikeAt = world.time + WITCH_SWIPE.windup;
    this.prey = p;
  }

  /**
   * Her strike: the broom hits whoever is in front and close, or a potion
   * flies to where her target stands now.
   * @param target Who it was aimed at.
   * @param prey Players monsters may go after.
   * @param world The world.
   */
  protected release(target: P | null, prey: P[], world: World): void {
    const def = this.def;
    if (this.swiping) {
      this.swiping = false;
      for (const p of prey) {
        const off = angleOff(Math.atan2(p.y - this.y, p.x - this.x), this.facing);
        if (distance(this, p) <= WITCH_SWIPE.reach + STRIKE_SLACK && off <= WITCH_SWIPE.arc) {
          this._ctx.hooks.hurt(p, WITCH_SWIPE.damage * this.power, def.label, this.x, this.y, WITCH_SWIPE.knockback, WITCH_SWIPE.slow);
        }
      }
      return;
    }
    const land = target ? Math.min(def.range! + 0.5, Math.max(1, distance(this, target))) : def.range!;
    this._ctx.hooks.shoot(this.x, this.y, this.facing, { kind: 'potion', damage: this.blow(), speed: POTION_SPEED, reach: land, by: def.label, land });
  }
}
