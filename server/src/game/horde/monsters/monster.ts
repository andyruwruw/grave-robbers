// Packages
import { STUN_SECONDS } from '@halloween/shared/gear/melee-rules';
import { MONSTER_ARMOR_GUARD } from '@halloween/shared/monsters/armor';
import { NECRO_WARD } from '@halloween/shared/monsters/kinds/necromancer';
import { KNOCKBACK_TIME } from '@halloween/shared/players/combat';
import { SPIKE_DAMAGE_PER_SECOND } from '@halloween/shared/players/health';
import { OBELISK_CURSE } from '@halloween/shared/structures/occult';
import { TRAP_DAMAGE, isTrap } from '@halloween/shared/structures/traps';
import { spikeDamage } from '@halloween/shared/skill-tree/upgrades/structure-upgrades';

// Local Imports
import { Afflicted } from './afflicted';

// Types
import type { World } from '../../world/world';
import type { DeathCause } from '../types/death';
import type { HitEffects, Target } from '../types/hooks';

/**
 * A server-side monster's behavior. Each tick runs the same template
 * (knockback, then whatever it does, then its wounds and traps); kinds
 * fill in the steps.
 */
export abstract class Monster<P extends Target> extends Afflicted<P> {
  /**
   * Whether it's winding up an attack.
   * @returns False unless it fights.
   */
  protected get windingUp(): boolean {
    return false;
  }

  /**
   * One tick: a risen ally whose time is up falls, then knockback, then
   * whatever it does, then its wounds (bleeding, burning, poison, a
   * curse) and traps.
   * @param dt Seconds since the last tick.
   * @param world The world.
   * @param present Players who aren't dead.
   * @param prey Players monsters may go after.
   */
  update(dt: number, world: World, present: P[], prey: P[]): void {
    if (this.turned.ally && world.time >= this.turned.until) {
      this._ctx.kill(this, Math.random() * Math.PI * 2, null, 'expired');
      return;
    }
    if (world.time < this.knock.until && !this.stepKnockback(dt, world)) {
      return;
    }
    this.moving = false;
    this.advance(dt, world, present, prey);
    for (const [wound, cause] of this.wounds) {
      if (wound.active(world.time) && this._ctx.roster.has(this.id) && this.drain(wound.rate * dt, wound.by, cause)) {
        return;
      }
    }
    const trap = world.map.get(Math.floor(this.x), Math.floor(this.y));
    if (this.hasBody && this._ctx.roster.has(this.id) && isTrap(trap)) {
      const before = Math.ceil(this.hp);
      const drained = Math.min(Math.max(0, this.hp), spikeDamage(SPIKE_DAMAGE_PER_SECOND * TRAP_DAMAGE[trap]!, world.structureQueries.level(Math.floor(this.x), Math.floor(this.y))) * this._ctx.dealt * dt);
      this.hp -= drained;
      if (trap === 'blood-fountain') {
        const tx = Math.floor(this.x);
        const ty = Math.floor(this.y);
        world.fountains.pump(tx, ty, drained);
        if (world.fountains.hold(tx, ty, this.id, this.kind)) {
          this._ctx.hooks.event({ t: 'catch', tx, ty, kind: this.kind });
        }
      }
      if (Math.ceil(this.hp) !== before) {
        this.hurts++;
      }
      if (this.hp <= 0) {
        this._ctx.kill(this, Math.random() * Math.PI * 2, null, 'trap');
      }
    }
  }

  /**
   * Plain damage with no hit behind it (a wound ticking, incense): no
   * knockback or stun, and it only flinches each time a whole point goes.
   * @param amount The damage, before the server's difficulty.
   * @param by Who gets the kill.
   * @param cause What a death from it counts as.
   * @returns Whether it killed it.
   */
  drain(amount: number, by: P | null, cause: DeathCause): boolean {
    const before = Math.ceil(this.hp);
    this.hp -= amount * this._ctx.dealt;
    if (Math.ceil(this.hp) !== before) {
      this.hurts++;
    }
    if (this.hp <= 0) {
      this._ctx.kill(this, Math.random() * Math.PI * 2, by, cause);
      return true;
    }
    return false;
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
   * It was just killed (bloaters queue their burst).
   */
  dying(): void {}

  /**
   * A stun took hold: it drops its attack.
   */
  protected onStunned(): void {
    this.cancelStrike();
  }

  /**
   * A hit landed on it, from (fromX, fromY): damage (through its kind's
   * rules, curses, a pin's bonus, execution, armor), then what the hit
   * afflicts it with, a stun or stagger, and knockback (none while
   * pinned; a hit with none leaves a knockback in progress alone). A
   * risen ally only takes other monsters' blows.
   * @param amount The damage.
   * @param fromX Where the hit came from (tiles).
   * @param fromY Where the hit came from (tiles).
   * @param world The world.
   * @param knockback How far it's pushed (tiles).
   * @param effects What the hit does besides damage.
   * @returns Whether it killed it.
   */
  takeHit(amount: number, fromX: number, fromY: number, world: World, knockback: number, effects: HitEffects<P>): boolean {
    const now = world.time;
    if (this.turned.ally && !effects.fromMonster) {
      return false;
    }
    knockback = this.adjustKnockback(knockback, effects);
    amount = this.adjustDamage(amount, effects) * this._ctx.dealt * (this.warded ? NECRO_WARD : 1) * this.takenMult(effects, now);
    if (this._ctx.wards.cursed(this)) {
      amount *= OBELISK_CURSE;
    }
    if (effects.executeCursed && this.cursed.active(now)) {
      amount *= Math.max(effects.executeCursed, effects.execute ?? 1);
    } else if (effects.execute && this.hp < this.maxHp / 2) {
      amount *= effects.execute;
    }
    this.hp -= this.armor && !effects.crush ? amount * MONSTER_ARMOR_GUARD[this.armor] : amount;
    this.hurts++;
    const dist = Math.hypot(this.x - fromX, this.y - fromY);
    this.afflict(effects, now, dist);
    if (effects.cursedKillBelow && this.cursed.active(now) && this.hp < this.maxHp * effects.cursedKillBelow) {
      this.hp = 0;
    }
    this.stagger(effects, now);
    this.lastSeen.see(fromX, fromY, now);
    if (dist > 0 && knockback > 0 && now >= this.pinned.until) {
      const speed = knockback / KNOCKBACK_TIME;
      this.knock.x = ((this.x - fromX) / dist) * speed;
      this.knock.y = ((this.y - fromY) / dist) * speed;
      this.knock.until = now + KNOCKBACK_TIME;
    }
    if (this.hp <= 0) {
      this._ctx.kill(this, Math.atan2(this.y - fromY, this.x - fromX), effects.by ?? null, 'hit');
      return true;
    }
    return false;
  }

  /**
   * A hit's stun (for `stunFor`, or STUN_SECONDS) or stagger. A stun
   * that rolls on a brute only staggers it when the hit says so.
   * @param effects What the hit does besides damage.
   * @param now The game clock.
   */
  private stagger(effects: HitEffects<P>, now: number): void {
    const stuns = effects.stun !== undefined && Math.random() < effects.stun;
    if (stuns && this.staggers && this.canBeStunned(now)) {
      this.stunUntil = Math.max(this.stunUntil, now + (effects.stunFor ?? STUN_SECONDS));
      this.onStunned();
      this.stumbles++;
    } else if ((stuns && effects.bruteStagger && !this.staggers) || (effects.stagger && this.windingUp && this.staggers && Math.random() < effects.stagger)) {
      this.cancelStrike();
      this.stumbles++;
    }
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
