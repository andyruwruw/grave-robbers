// Packages
import { GHOUL_CIRCLE, GHOUL_LEAP, GHOUL_LEAP_TIME, GHOUL_MIN_POUNCE, GHOUL_ORBIT } from '@halloween/shared/monsters/kinds/ghoul';

// Local Imports
import { distance } from '../../helpers/geometry';
import { Shambler } from '../shambler';

// Types
import type { World } from '../../../world/world';
import type { Target } from '../../types/hooks';

/**
 * A ghoul: scuttles on all fours, runs circles around its prey until it
 * can pounce, then leaps.
 */
export class Ghoul<P extends Target> extends Shambler<P> {
  /**
   * Which way it circles its prey (1 or -1).
   */
  orbit = 1;

  /**
   * Until when it keeps circling that way.
   */
  orbitUntil = 0;

  /**
   * Circles a player close by until it can pounce, then pounces.
   * @param p The player.
   * @param dt Seconds since the last tick.
   * @param world The world.
   * @returns True when it took this tick.
   */
  protected engage(p: P, dt: number, world: World): boolean {
    const def = this.def;
    if (distance(this, p) <= GHOUL_CIRCLE && !(world.time >= this.nextAttackAt && distance(this, p) <= def.range! && distance(this, p) >= GHOUL_MIN_POUNCE)) {
      this.setHunting(true);
      this.circle(p, dt, world);
      return true;
    }
    if (def.range !== undefined && distance(this, p) <= def.range && world.time >= this.nextAttackAt) {
      this.setHunting(true);
      this.attack(p, world);
      return true;
    }
    return false;
  }

  /**
   * Runs circles around its prey, a few tiles out, now and then switching
   * direction (or when it bumps into something).
   * @param p The player.
   * @param dt Seconds since the last tick.
   * @param world The world.
   */
  private circle(p: P, dt: number, world: World): void {
    if (world.time >= this.orbitUntil || this.bumping > 0.3) {
      this.orbit = this.orbitUntil === 0 ? (Math.random() < 0.5 ? 1 : -1) : -this.orbit;
      this.orbitUntil = world.time + 1.5 + Math.random() * 2.5;
      this.bumping = 0;
    }
    const around = Math.atan2(this.y - p.y, this.x - p.x) + this.orbit * 0.8;
    const step = this.def.speed * dt;
    const fromX = this.x;
    const fromY = this.y;
    this.moveToward(p.x + Math.cos(around) * GHOUL_ORBIT, p.y + Math.sin(around) * GHOUL_ORBIT, step, world, true);
    this.bumping = Math.hypot(this.x - fromX, this.y - fromY) < step * 0.3 ? this.bumping + dt : 0;
  }

  /**
   * Its strike: a pounce along its aim.
   * @param target Who it was aimed at.
   * @param prey Players monsters may go after.
   * @param world The world.
   */
  protected release(target: P | null, prey: P[], world: World): void {
    this.startLeap(world, GHOUL_LEAP_TIME, GHOUL_LEAP / GHOUL_LEAP_TIME);
  }
}
