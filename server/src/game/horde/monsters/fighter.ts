// Packages
import { GEAR } from '@halloween/shared/gear/gear-catalog';
import { ZOMBIE_ARMED_DAMAGE, ZOMBIE_WEAPON_DAMAGE } from '@halloween/shared/monsters/kinds/zombie';
import { STRIKE_SLACK } from '@halloween/shared/monsters/monster-stats';
import { MONSTER_RADIUS } from '@halloween/shared/monsters/movement';
import { MELEE_REACH_DOWN, MELEE_REACH_UP } from '@halloween/shared/players/combat';
import { moveWithCollision } from '@halloween/shared/world/collision';

// Local Imports
import { TURNED_KNOCKBACK, TURNED_SIGHT } from '../config/turned';
import { angleOff, distance } from '../helpers/geometry';
import { monsterBlocked } from '../helpers/terrain';
import { Walker } from './walker';

// Types
import type { World } from '../../world/world';
import type { Target } from '../types/hooks';
import type { Monster } from './monster';

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
   * Fighters can be turned on the other monsters.
   * @returns True.
   */
  protected get canTurn(): boolean {
    return true;
  }

  /**
   * What it does this tick: a leap in the air, nothing while stunned,
   * fighting other monsters while turned, a windup, or its own behavior.
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
    } else if (world.time < this.turned.until) {
      this.fightMonsters(dt, world);
    } else if (this.strikeAt !== null) {
      this.windUp(dt, world, prey);
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
   * Drops out of a leap in progress (a pin).
   */
  protected cancelLeap(): void {
    this.leapUntil = 0;
  }

  /**
   * Turned: goes for the nearest monster with a body that isn't turned
   * itself and hits it whenever its attack is ready, for whoever turned it.
   * @param dt Seconds since the last tick.
   * @param world The world.
   */
  private fightMonsters(dt: number, world: World): void {
    let foe: Monster<P> | null = null;
    let best = TURNED_SIGHT;
    for (const m of this._ctx.roster.values()) {
      const d = distance(this, m);
      if (m !== this && m.hasBody && world.time >= m.turned.until && d < best) {
        best = d;
        foe = m;
      }
    }
    if (!foe) {
      return;
    }
    if (best > this.def.reach + MONSTER_RADIUS) {
      this.moveToward(foe.x, foe.y, this.def.speed * dt, world);
      return;
    }
    this.facing = Math.atan2(foe.y - this.y, foe.x - this.x);
    if (world.time >= this.nextAttackAt) {
      this.nextAttackAt = world.time + this.def.cooldown;
      this.attacks++;
      foe.takeHit(this.blow(), this.x, this.y, world, this.def.knockback ?? TURNED_KNOCKBACK, { by: this.turned.by, fromMonster: true });
    }
  }

  /**
   * Whether a player is close enough to attack (`reach`, plus `lunge` once
   * the next swing is ready), and not too far above or below (up on a
   * platform, say).
   * @param p The player.
   * @param world The world.
   * @returns True when in reach.
   */
  protected inReach(p: P, world: World): boolean {
    const rise = world.map.elevationAt(p.x, p.y) - world.map.elevationAt(this.x, this.y);
    const lunge = world.time >= this.nextAttackAt ? this.def.lunge ?? 0 : 0;
    return distance(this, p) <= this.def.reach + lunge && rise <= MELEE_REACH_UP && -rise <= MELEE_REACH_DOWN;
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
   * Keeps turning toward its target while an attack winds up (lunging in
   * with `lunge`, else holding still), then lets it go.
   * @param dt Seconds this step.
   * @param world The world.
   * @param prey Players monsters may go after.
   */
  private windUp(dt: number, world: World, prey: P[]): void {
    const p = this.prey;
    if (p && !p.dead && this.tracking(world.time)) {
      this.facing = Math.atan2(p.y - this.y, p.x - this.x);
      this.lungeIn(dt, p, world);
    }
    if (world.time >= this.strikeAt!) {
      this.strike(prey, world);
    }
  }

  /**
   * Steps in toward the prey during the windup, `lunge` tiles over the
   * whole windup, until within `reach`.
   * @param dt Seconds this step.
   * @param p The prey.
   * @param world The world.
   */
  private lungeIn(dt: number, p: P, world: World): void {
    const def = this.def;
    if (!def.lunge || distance(this, p) <= def.reach) {
      return;
    }
    const step = (def.lunge / def.windup) * this.slowFactor(world.time) * dt;
    Object.assign(this, moveWithCollision(monsterBlocked(world, this), this.x, this.y, Math.cos(this.facing) * step, Math.sin(this.facing) * step, MONSTER_RADIUS));
    this.moving = true;
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
    const step = this.leapSpeed * this.slowFactor(world.time) * dt;
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
    const armed = !this.held ? 0 : GEAR[this.held].junk ? ZOMBIE_ARMED_DAMAGE : ZOMBIE_WEAPON_DAMAGE;
    return (this.def.damage + armed) * this.power;
  }
}
