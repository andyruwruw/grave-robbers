// Packages
import { BLEED_SECONDS, STUN_SECONDS } from '@halloween/shared/gear/melee-rules';
import { MONSTER_ARMOR_GUARD } from '@halloween/shared/monsters/armor';
import { KNOCKBACK_TIME } from '@halloween/shared/players/combat';
import { SPIKE_DAMAGE_PER_SECOND } from '@halloween/shared/players/health';
import { OBELISK_CURSE } from '@halloween/shared/structures/occult';
import { TRAP_DAMAGE, isTrap } from '@halloween/shared/structures/traps';
import { spikeDamage } from '@halloween/shared/skill-tree/upgrades/structure-upgrades';

// Local Imports
import { MonsterCore } from './monster-core';

// Types
import type { World } from '../../world/world';
import type { HitEffects, Target } from '../types/hooks';

/**
 * A server-side monster's behavior. Each tick runs the same template
 * (knockback, then whatever it does, then bleeding and traps); kinds fill
 * in the steps.
 */
export abstract class Monster<P extends Target> extends MonsterCore<P> {
  /**
   * Whether a bleeding hit wounds it.
   * @returns True unless it's a ghost.
   */
  protected get bleeds(): boolean {
    return true;
  }

  /**
   * Whether stuns and staggers work on it.
   * @returns True unless it's a brute.
   */
  protected get staggers(): boolean {
    return true;
  }

  /**
   * Whether it's winding up an attack.
   * @returns False unless it fights.
   */
  protected get windingUp(): boolean {
    return false;
  }

  /**
   * One tick: knockback, then whatever it does, then bleeding and traps.
   * @param dt Seconds since the last tick.
   * @param world The world.
   * @param present Players who aren't dead.
   * @param prey Players monsters may go after.
   */
  update(dt: number, world: World, present: P[], prey: P[]): void {
    if (world.time < this.knock.until && !this.stepKnockback(dt, world)) {
      return;
    }
    this.moving = false;
    this.advance(dt, world, present, prey);
    if (world.time < this.bleeding.until && this._ctx.roster.has(this.id)) {
      const before = Math.ceil(this.hp);
      this.hp -= this.bleeding.rate * dt;
      if (Math.ceil(this.hp) !== before) {
        this.hurts++;
      }
      if (this.hp <= 0) {
        this._ctx.kill(this, Math.random() * Math.PI * 2, this.bleeding.by);
        return;
      }
    }
    const trap = world.map.get(Math.floor(this.x), Math.floor(this.y));
    if (this.hasBody && this._ctx.roster.has(this.id) && isTrap(trap)) {
      const before = Math.ceil(this.hp);
      const drained = Math.min(Math.max(0, this.hp), spikeDamage(SPIKE_DAMAGE_PER_SECOND * TRAP_DAMAGE[trap]!, world.structureQueries.level(Math.floor(this.x), Math.floor(this.y))) * dt);
      this.hp -= drained;
      if (trap === 'blood-fountain') {
        world.fountains.pump(Math.floor(this.x), Math.floor(this.y), drained);
      }
      if (Math.ceil(this.hp) !== before) {
        this.hurts++;
      }
      if (this.hp <= 0) {
        this._ctx.kill(this, Math.random() * Math.PI * 2);
      }
    }
  }

  /**
   * Moves it along a knockback.
   * @param dt Seconds since the last tick.
   * @param world The world.
   * @returns False if it's gone (fell into a chasm, or died of the fall).
   */
  protected abstract stepKnockback(dt: number, world: World): boolean;

  /**
   * What it does this tick once knockback is done: nothing while stunned,
   * else its own behavior.
   * @param dt Seconds since the last tick.
   * @param world The world.
   * @param present Players who aren't dead.
   * @param prey Players monsters may go after.
   */
  protected advance(dt: number, world: World, present: P[], prey: P[]): void {
    if (world.time < this.stunUntil) {
      this.moving = false;
    } else {
      this.act(dt, world, present, prey);
    }
  }

  /**
   * Its own behavior for a tick.
   * @param dt Seconds since the last tick.
   * @param world The world.
   * @param present Players who aren't dead.
   * @param prey Players monsters may go after.
   */
  protected abstract act(dt: number, world: World, present: P[], prey: P[]): void;

  /**
   * A hit's knockback on this kind.
   * @param knockback The knockback (tiles).
   * @param effects What the hit does besides damage.
   * @returns The knockback it takes.
   */
  protected adjustKnockback(knockback: number, effects: HitEffects<P>): number {
    return knockback;
  }

  /**
   * A hit's damage on this kind, before curses, armor and execute.
   * @param amount The damage.
   * @param effects What the hit does besides damage.
   * @returns The damage it takes.
   */
  protected adjustDamage(amount: number, effects: HitEffects<P>): number {
    return amount;
  }

  /**
   * Whether a stun can take hold right now.
   * @param now The game clock.
   * @returns True unless it's mid-leap.
   */
  protected canBeStunned(now: number): boolean {
    return true;
  }

  /**
   * Breaks off whatever attack it's winding up.
   */
  protected cancelStrike(): void {}

  /**
   * A stun took hold: it drops its attack.
   */
  protected onStunned(): void {
    this.cancelStrike();
  }

  /**
   * A player's swing landed on it, from (fromX, fromY).
   * @param amount The damage.
   * @param fromX Where the hit came from (tiles).
   * @param fromY Where the hit came from (tiles).
   * @param world The world.
   * @param knockback How far it's pushed (tiles).
   * @param effects What the hit does besides damage.
   * @returns Whether it killed it.
   */
  takeHit(amount: number, fromX: number, fromY: number, world: World, knockback: number, effects: HitEffects<P>): boolean {
    knockback = this.adjustKnockback(knockback, effects);
    amount = this.adjustDamage(amount, effects);
    if (this._ctx.wards.cursed(this)) {
      amount *= OBELISK_CURSE;
    }
    if (effects.execute && this.hp < this.maxHp / 2) {
      amount *= effects.execute;
    }
    this.hp -= this.armor && !effects.crush ? amount * MONSTER_ARMOR_GUARD[this.armor] : amount;
    this.hurts++;
    if (effects.bleed && this.bleeds) {
      this.bleeding.rate = Math.max(world.time < this.bleeding.until ? this.bleeding.rate : 0, effects.bleed);
      this.bleeding.until = world.time + BLEED_SECONDS;
      this.bleeding.by = effects.by ?? null;
    }
    if (effects.stun && this.staggers && this.canBeStunned(world.time) && Math.random() < effects.stun) {
      this.stunUntil = world.time + STUN_SECONDS;
      this.onStunned();
      this.stumbles++;
    } else if (effects.stagger && this.windingUp && this.staggers && Math.random() < effects.stagger) {
      this.cancelStrike();
      this.stumbles++;
    }
    this.lastSeen.see(fromX, fromY, world.time);
    const dist = Math.hypot(this.x - fromX, this.y - fromY);
    if (dist > 0) {
      const speed = knockback / KNOCKBACK_TIME;
      this.knock.x = ((this.x - fromX) / dist) * speed;
      this.knock.y = ((this.y - fromY) / dist) * speed;
      this.knock.until = world.time + KNOCKBACK_TIME;
    }
    if (this.hp <= 0) {
      this._ctx.kill(this, Math.atan2(this.y - fromY, this.x - fromX));
      return true;
    }
    return false;
  }

  /**
   * Moves a walker by (dx, dy) with wall collision, when a player bumps
   * it (nothing for a ghost).
   * @param dx How far across (tiles).
   * @param dy How far down (tiles).
   * @param world The world.
   */
  shove(dx: number, dy: number, world: World): void {}

  /**
   * Puts it somewhere by hand (the TV's mouse).
   * @param x Where (tiles).
   * @param y Where (tiles).
   */
  teleport(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.knock.until = 0;
  }
}
