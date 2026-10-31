// Packages
import {
  WEREWOLF_FLEE_SECONDS,
  WEREWOLF_GONE,
  WEREWOLF_KNOCKBACK,
  WEREWOLF_LEAP,
  WEREWOLF_LEAP_TIME,
  WEREWOLF_POUNCE_EVERY,
  WEREWOLF_POUNCE_MIN,
  WEREWOLF_POUNCE_WINDUP,
  WEREWOLF_STRAFE_FLIP,
  WEREWOLF_STRAFE_IN,
  WEREWOLF_STRAFE_SPEED,
} from '@halloween/shared/monsters/kinds/werewolf';
import { MONSTER_RADIUS } from '@halloween/shared/monsters/movement';
import { moveWithCollision } from '@halloween/shared/world/collision';
import { VAMPIRE_WALL_DAMAGE } from '@halloween/shared/monsters/kinds/vampire';

// Local Imports
import { distance } from '../../helpers/geometry';
import { monsterBlocked } from '../../helpers/terrain';
import { Shambler } from '../shambler';

// Types
import type { World } from '../../../world/world';
import type { HordeContext } from '../../horde-context';
import type { HitEffects, Target } from '../../types/hooks';
import type { MonsterInit } from '../../types/monster';

/**
 * A werewolf: comes with a blood moon, runs down its prey as fast as a
 * vampire, pounces from a distance like a ghoul, and claws up close. Once
 * the moon that brought it sets, it runs off and is gone.
 */
export class Werewolf<P extends Target> extends Shambler<P> {
  /**
   * Whether a blood moon brought it (summoned ones stay after).
   */
  readonly moonborn: boolean;

  /**
   * Whether the attack winding up is a pounce.
   */
  pouncing = false;

  /**
   * When it may pounce next.
   */
  pounceAt = 0;

  /**
   * When it started running off, once its moon set (0: it hasn't).
   */
  fleeingSince = 0;

  /**
   * Which way it circles its prey between pounces (1 or -1).
   */
  strafeSide = Math.random() < 0.5 ? 1 : -1;

  /**
   * When it next switches the way it circles.
   */
  strafeFlipAt = 0;

  /**
   * Makes the werewolf, noting whether a blood moon is up.
   * @param init Everything it's made with.
   * @param ctx What the horde's parts share.
   */
  constructor(init: MonsterInit, ctx: HordeContext<P>) {
    super(init, ctx);
    this.moonborn = (ctx.mods.spawnMix.werewolf ?? 0) > 0;
  }

  /**
   * How hard it tears into a structure.
   * @returns The damage per blow.
   */
  protected get wallDamage(): number {
    return VAMPIRE_WALL_DAMAGE;
  }

  /**
   * Hunts, or once its moon has set, runs off.
   * @param dt Seconds since the last tick.
   * @param world The world.
   * @param present Players who aren't dead.
   * @param prey Players monsters may go after.
   */
  protected act(dt: number, world: World, present: P[], prey: P[]): void {
    if (this.moonborn && !((this._ctx.mods.spawnMix.werewolf ?? 0) > 0)) {
      this.runOff(dt, world, present);
      return;
    }
    super.act(dt, world, present, prey);
  }

  /**
   * Pounces on a player at a distance when it may, and circles them while
   * its next pounce is coming (`strafe`).
   * @param p The player.
   * @param dt Seconds since the last tick.
   * @param world The world.
   * @returns True when it took this tick.
   */
  protected engage(p: P, dt: number, world: World): boolean {
    const d = distance(this, p);
    if (d < WEREWOLF_POUNCE_MIN || d > this.def.range!) {
      return false;
    }
    if (world.time < this.pounceAt) {
      this.strafe(p, dt, world);
      return true;
    }
    this.setHunting(true);
    this.facing = Math.atan2(p.y - this.y, p.x - this.x);
    this.path = [];
    this.repathAt = 0;
    this.pounceAt = world.time + WEREWOLF_POUNCE_EVERY;
    this.nextAttackAt = Math.max(this.nextAttackAt, world.time + WEREWOLF_POUNCE_WINDUP + WEREWOLF_LEAP_TIME);
    this.swipes++;
    this.pouncing = true;
    this.strikeAt = world.time + WEREWOLF_POUNCE_WINDUP;
    this.prey = p;
    return true;
  }

  /**
   * Lopes sideways around its prey, edging in, facing where it runs;
   * switches sides now and then, or at once when something stops it.
   * @param p The prey.
   * @param dt Seconds since the last tick.
   * @param world The world.
   */
  private strafe(p: P, dt: number, world: World): void {
    this.setHunting(true);
    this.path = [];
    this.repathAt = 0;
    if (world.time >= this.strafeFlipAt) {
      this.strafeSide = -this.strafeSide;
      this.strafeFlipAt = world.time + WEREWOLF_STRAFE_FLIP * (1 + Math.random());
    }
    const toward = Math.atan2(p.y - this.y, p.x - this.x);
    const angle = toward + this.strafeSide * (Math.PI / 2 - WEREWOLF_STRAFE_IN);
    const step = this.def.speed * WEREWOLF_STRAFE_SPEED * this.slowFactor(world.time) * dt;
    const was = { x: this.x, y: this.y };
    Object.assign(this, moveWithCollision(monsterBlocked(world, this), this.x, this.y, Math.cos(angle) * step, Math.sin(angle) * step, MONSTER_RADIUS));
    if (Math.hypot(this.x - was.x, this.y - was.y) < step * 0.5) {
      this.strafeFlipAt = 0;
    }
    this.facing = angle;
    this.moving = true;
  }

  /**
   * Breaks off the attack winding up, pounce or claws.
   */
  protected cancelStrike(): void {
    super.cancelStrike();
    this.pouncing = false;
  }

  /**
   * Its strike: a pounce along its aim, or its claws.
   * @param target Who it was aimed at.
   * @param prey Players monsters may go after.
   * @param world The world.
   */
  protected release(target: P | null, prey: P[], world: World): void {
    if (this.pouncing) {
      this.pouncing = false;
      this.startLeap(world, WEREWOLF_LEAP_TIME, WEREWOLF_LEAP / WEREWOLF_LEAP_TIME);
      return;
    }
    super.release(target, prey, world);
  }

  /**
   * It's heavy: hits throw it only part as far.
   * @param knockback The knockback (tiles).
   * @param effects What the hit does besides damage.
   * @returns The knockback it takes.
   */
  protected adjustKnockback(knockback: number, effects: HitEffects<P>): number {
    return knockback * WEREWOLF_KNOCKBACK;
  }

  /**
   * Its moon has set: it runs from the nearest player and is gone, in a
   * puff of shadow, once nobody is near or it has run long enough.
   * @param dt Seconds since the last tick.
   * @param world The world.
   * @param present Players who aren't dead.
   */
  private runOff(dt: number, world: World, present: P[]): void {
    this.fleeingSince ||= world.time;
    this.setHunting(false);
    const near = present.reduce<P | null>((best: P | null, p: P): P | null => (!best || distance(this, p) < distance(this, best) ? p : best), null);
    if (!near || distance(this, near) >= WEREWOLF_GONE || world.time - this.fleeingSince >= WEREWOLF_FLEE_SECONDS) {
      this._ctx.hooks.event({ t: 'blink', fromX: this.x, fromY: this.y, x: this.x, y: this.y });
      this._ctx.roster.delete(this.id);
      return;
    }
    const away = Math.atan2(this.y - near.y, this.x - near.x);
    this.moveToward(this.x + Math.cos(away), this.y + Math.sin(away), this.def.speed * dt, world);
  }
}
