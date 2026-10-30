// Packages
import { ZOMBIE_ARMED_DAMAGE } from '@halloween/shared/monsters/kinds/zombie';
import { STRIKE_SLACK } from '@halloween/shared/monsters/monster-stats';
import { MONSTER_RADIUS } from '@halloween/shared/monsters/movement';
import { MELEE_REACH_DOWN, MELEE_REACH_UP } from '@halloween/shared/players/combat';
import { moveWithCollision } from '@halloween/shared/world/collision';

// Local Imports
import { angleOff, distance } from '../helpers/geometry';
import { monsterBlocked } from '../helpers/terrain';
import { Walker } from './walker';

// Types
import type { World } from '../../world/world';
import type { Target } from '../types/hooks';

/**
 * A walker that attacks players: it winds up a strike (turning to keep
 * its aim on its prey), then lets it go. Some strikes are leaps that fly
 * along the aim and hit the first player touched.
 */
export abstract class Fighter<P extends Target> extends Walker<P> {
  /**
   * When the attack it's winding up lands (null when it isn't). It keeps
   * turning to face its prey until then, so its aim is perfect, and only
   * being out of reach dodges it. Hits don't interrupt it.
   */
  strikeAt: number | null = null;

  /**
   * Who the attack winding up is aimed at.
   */
  prey: P | null = null;

  /**
   * Until when a ghoul's pounce or a demon's lunge is in the air.
   */
  leapUntil = 0;

  /**
   * Whether the leap already caught someone on the way.
   */
  leapHit = false;

  /**
   * How fast the leap flies (tiles/s).
   */
  leapSpeed = 0;

  /**
   * Whether it's winding up an attack.
   * @returns True while a strike is coming.
   */
  protected get windingUp(): boolean {
    return this.strikeAt !== null;
  }

  /**
   * What it does this tick: a leap in the air, nothing while stunned, a
   * windup, or its own behavior.
   * @param dt Seconds since the last tick.
   * @param world The world.
   * @param present Players who aren't dead.
   * @param prey Players monsters may go after.
   */
  protected advance(dt: number, world: World, present: P[], prey: P[]): void {
    if (world.time < this.leapUntil) {
      this.leap(dt, world, prey);
    } else if (world.time < this.stunUntil) {
      this.moving = false;
    } else if (this.strikeAt !== null) {
      this.windUp(world, prey);
    } else {
      this.act(dt, world, present, prey);
    }
  }

  /**
   * Whether a stun can take hold right now.
   * @param now The game clock.
   * @returns False mid-leap.
   */
  protected canBeStunned(now: number): boolean {
    return now >= this.leapUntil;
  }

  /**
   * Breaks off the attack winding up.
   */
  protected cancelStrike(): void {
    this.strikeAt = null;
    this.prey = null;
  }

  /**
   * Whether a player is close enough to attack, and not too far above or
   * below (up on a platform, say).
   * @param p The player.
   * @param world The world.
   * @returns True when in reach.
   */
  protected inReach(p: P, world: World): boolean {
    const rise = world.map.elevationAt(p.x, p.y) - world.map.elevationAt(this.x, this.y);
    return distance(this, p) <= this.def.reach && rise <= MELEE_REACH_UP && -rise <= MELEE_REACH_DOWN;
  }

  /**
   * Turns on a player and, when it may, starts winding up an attack.
   * @param p The player.
   * @param world The world.
   */
  protected attack(p: P, world: World): void {
    const def = this.def;
    this.facing = Math.atan2(p.y - this.y, p.x - this.x);
    this.path = [];
    this.repathAt = 0;
    if (world.time < this.nextAttackAt) {
      return;
    }
    this.nextAttackAt = world.time + def.cooldown;
    this.attacks++;
    this.strikeAt = world.time + def.windup;
    this.prey = p;
  }

  /**
   * Whether it still turns toward its prey while winding up: until `lock`
   * seconds before the strike lands, if it has one.
   * @param now The game clock.
   * @returns True while it still turns.
   */
  protected tracking(now: number): boolean {
    return this.strikeAt! - now > (this.def.lock ?? 0);
  }

  /**
   * Holds still and keeps turning toward its target while an attack winds
   * up, then lets it go.
   * @param world The world.
   * @param prey Players monsters may go after.
   */
  private windUp(world: World, prey: P[]): void {
    const p = this.prey;
    if (p && !p.dead && this.tracking(world.time)) {
      this.facing = Math.atan2(p.y - this.y, p.x - this.x);
    }
    if (world.time >= this.strikeAt!) {
      this.strike(prey, world);
    }
  }

  /**
   * An attack's windup is over: it lets go.
   * @param prey Players monsters may go after.
   * @param world The world.
   */
  private strike(prey: P[], world: World): void {
    this.strikeAt = null;
    const target = this.prey;
    this.prey = null;
    this.release(target, prey, world);
  }

  /**
   * What its strike does: a melee hitbox lands on whoever is still in
   * reach and in front.
   * @param target Who it was aimed at.
   * @param prey Players monsters may go after.
   * @param world The world.
   */
  protected release(target: P | null, prey: P[], world: World): void {
    const def = this.def;
    for (const p of prey) {
      const rise = world.map.elevationAt(p.x, p.y) - world.map.elevationAt(this.x, this.y);
      const off = angleOff(Math.atan2(p.y - this.y, p.x - this.x), this.facing);
      if (distance(this, p) <= def.reach + STRIKE_SLACK && off <= def.arc && rise <= MELEE_REACH_UP && -rise <= MELEE_REACH_DOWN) {
        this.thorns(this._ctx.hooks.hurt(p, this.blow(), def.label, this.x, this.y, def.knockback), p, world);
      }
    }
  }

  /**
   * Leaps along its aim.
   * @param world The world.
   * @param seconds How long it's in the air.
   * @param speed How fast it flies (tiles/s).
   */
  protected startLeap(world: World, seconds: number, speed: number): void {
    this.leapUntil = world.time + seconds;
    this.leapSpeed = speed;
    this.leapHit = false;
  }

  /**
   * In mid-leap: flies along its aim and hits the first player it touches.
   * @param dt Seconds since the last tick.
   * @param world The world.
   * @param prey Players monsters may go after.
   */
  private leap(dt: number, world: World, prey: P[]): void {
    const step = this.leapSpeed * dt;
    Object.assign(this, moveWithCollision(monsterBlocked(world, this), this.x, this.y, Math.cos(this.facing) * step, Math.sin(this.facing) * step, MONSTER_RADIUS));
    this.moving = true;
    if (this.leapHit) {
      return;
    }
    const def = this.def;
    const p = prey.find((q: P): boolean => distance(this, q) <= def.reach);
    if (p) {
      this.leapHit = true;
      this.thorns(this._ctx.hooks.hurt(p, this.blow(), def.label, this.x, this.y, def.knockback), p, world);
    }
  }

  /**
   * Bone armor bites back: a monster that hit someone wearing it takes
   * `amount`.
   * @param amount What bites back.
   * @param p Who it hit.
   * @param world The world.
   */
  protected thorns(amount: number, p: P, world: World): void {
    if (amount > 0 && this._ctx.roster.has(this.id)) {
      this.takeHit(amount, p.x, p.y, world, 0, { by: p });
    }
  }

  /**
   * What one of its hits does to a player, before armor.
   * @returns The damage.
   */
  protected blow(): number {
    return (this.def.damage + (this.held ? ZOMBIE_ARMED_DAMAGE : 0)) * this.power;
  }
}
