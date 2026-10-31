// Packages
import { BLEED_SECONDS, TIP_FROM } from '@halloween/shared/gear/melee-rules';
import { GHOST_DAMAGE } from '@halloween/shared/monsters/kinds/ghost';
import {
  STATUS_BLEEDING,
  STATUS_BURNING,
  STATUS_CURSED,
  STATUS_GLOWING,
  STATUS_PINNED,
  STATUS_POISONED,
  STATUS_SLOWED,
  STATUS_TURNED,
} from '@halloween/shared/monsters/monster-status';

// Local Imports
import { MonsterCore } from './monster-core';
import { Burning } from './state/burning';
import { Cursed } from './state/cursed';
import { Pinned } from './state/pinned';
import { Poisoned } from './state/poisoned';
import { Slowed } from './state/slowed';
import { Turned } from './state/turned';

// Types
import type { PinTrick } from '@halloween/shared/gear/types/status-tricks';
import type { DeathCause } from '../types/death';
import type { HitEffects, Target } from '../types/hooks';
import type { Wound } from './state/wound';

/**
 * What can be afflicting a monster besides its health: wounds that hurt
 * over time (bleeding, burning, poison, a curse), slows, a pin, and being
 * turned on the other monsters. Hits and ground patches lay them on
 * (`afflict`); `Monster` ticks the wounds and the movement code reads
 * `slowFactor`.
 */
export abstract class Afflicted<P extends Target> extends MonsterCore<P> {
  /**
   * Burning.
   */
  readonly burning = new Burning<P>();

  /**
   * Poisoned.
   */
  readonly poisoned = new Poisoned<P>();

  /**
   * Hex cursed.
   */
  readonly cursed = new Cursed<P>();

  /**
   * Slowed by a hit.
   */
  readonly slowed = new Slowed();

  /**
   * Pinned in place.
   */
  readonly pinned = new Pinned<P>();

  /**
   * Turned on the other monsters, or risen on the players' side.
   */
  readonly turned = new Turned<P>();

  /**
   * Whether a bleeding (or poisoned) hit wounds it.
   * @returns True unless it's a ghost.
   */
  protected get bleeds(): boolean {
    return true;
  }

  /**
   * Whether stuns, staggers and pins work on it.
   * @returns True unless it's a brute.
   */
  protected get staggers(): boolean {
    return true;
  }

  /**
   * Whether it can be turned on the other monsters.
   * @returns False unless it fights.
   */
  protected get canTurn(): boolean {
    return false;
  }

  /**
   * Its wounds that hurt over time, each with the cause a death from it
   * gets.
   * @returns The wounds.
   */
  protected get wounds(): [Wound<P>, DeathCause][] {
    return [[this.bleeding, 'bleed'], [this.burning, 'burn'], [this.poisoned, 'poison'], [this.cursed, 'curse']];
  }

  /**
   * Breaks off whatever attack it's winding up.
   */
  protected abstract cancelStrike(): void;

  /**
   * A stun took hold.
   */
  protected abstract onStunned(): void;

  /**
   * Drops out of a leap in progress (nothing unless it leaps).
   */
  protected cancelLeap(): void {}

  /**
   * Lays on what a hit (or a patch of ground) afflicts it with: a bleed,
   * a burn, poison, a curse, a slow, a pin, being turned. Each refreshes
   * rather than stacks. A curse on a ghost hurts at its GHOST_DAMAGE
   * share, like a weapon's hits.
   * @param effects What the hit does besides damage.
   * @param now The game clock.
   * @param dist How far off the hitter stood (tiles), for a tip-only pin.
   */
  afflict(effects: HitEffects<P>, now: number, dist: number | null = null): void {
    const by = effects.by ?? null;
    const wasBleeding = this.bleeding.active(now);
    if (effects.bleed && this.bleeds) {
      this.bleeding.refresh(effects.bleed, BLEED_SECONDS, by, now);
      this.bleeding.raise = effects.raise ?? null;
    }
    if (effects.burn && this.hasBody) {
      const light = this.burning.active(now) ? this.burning.light : 0;
      this.burning.refresh(effects.burn.rate, effects.burn.seconds, by, now);
      this.burning.light = Math.max(light, effects.burn.light ?? 0);
    }
    if (effects.poison && this.bleeds && Math.random() < effects.poison.chance) {
      this.poisoned.refresh(effects.poison.rate, effects.poison.seconds, by, now);
    }
    if (effects.curse && Math.random() < effects.curse.chance) {
      const was = this.cursed.active(now);
      this.cursed.refresh(effects.curse.rate * (this.hasBody ? 1 : GHOST_DAMAGE), effects.curse.seconds, by, now);
      this.cursed.taken = Math.max(was ? this.cursed.taken : 1, effects.curse.taken);
      this.cursed.slow = Math.min(was ? this.cursed.slow : 1, effects.curse.slow);
    }
    if (effects.slowOnHit && Math.random() < effects.slowOnHit.chance) {
      const was = now < this.slowed.until;
      this.slowed.factor = Math.min(was ? this.slowed.factor : 1, effects.slowOnHit.factor);
      this.slowed.until = Math.max(was ? this.slowed.until : 0, now + effects.slowOnHit.seconds);
    }
    if (effects.pin) {
      this.pin(effects.pin, effects, now, dist);
    }
    if (effects.turn && wasBleeding && effects.turn.kinds.includes(this.kind) && Math.random() < effects.turn.chance) {
      this.turnOn(effects.turn.seconds, by, false, now);
    }
  }

  /**
   * Holds it in place (never a brute, and only the pin's kinds): a stun
   * that cancels a leap or windup in progress, and a damage bonus for
   * everyone but who pinned it.
   * @param pin The pin.
   * @param effects What the hit does besides damage.
   * @param now The game clock.
   * @param dist How far off the hitter stood (tiles), if known.
   */
  private pin(pin: PinTrick, effects: HitEffects<P>, now: number, dist: number | null): void {
    if (!this.staggers || (pin.kinds && !pin.kinds.includes(this.kind))) {
      return;
    }
    if (pin.tip && !(effects.tipped ?? (dist !== null && effects.reach !== undefined && dist > effects.reach * TIP_FROM))) {
      return;
    }
    this.pinned.until = Math.max(this.pinned.until, now + pin.seconds);
    this.pinned.by = effects.by ?? null;
    this.pinned.bonus = pin.bonus;
    this.stunUntil = Math.max(this.stunUntil, this.pinned.until);
    this.cancelLeap();
    this.onStunned();
    this.stumbles++;
  }

  /**
   * Turns it on the other monsters for a while, fighting for `by` (or,
   * as an ally, on the players' side for good until it falls).
   * @param seconds How long.
   * @param by Who it fights for.
   * @param ally Whether it's a risen ally.
   * @param now The game clock.
   * @returns False if its kind can't be turned.
   */
  turnOn(seconds: number, by: P | null, ally: boolean, now: number): boolean {
    if (!this.canTurn) {
      return false;
    }
    this.turned.until = Math.max(this.turned.until, now + seconds);
    this.turned.by = by;
    this.turned.ally ||= ally;
    this.cancelStrike();
    this.cancelLeap();
    return true;
  }

  /**
   * What a hit's damage is multiplied by for what's afflicting it: a
   * curse's `taken`, and a pin's bonus for anyone but who pinned it.
   * @param effects What the hit does besides damage.
   * @param now The game clock.
   * @returns The multiplier.
   */
  protected takenMult(effects: HitEffects<P>, now: number): number {
    const cursed = this.cursed.active(now) ? this.cursed.taken : 1;
    return now < this.pinned.until && effects.by && effects.by !== this.pinned.by ? cursed * this.pinned.bonus : cursed;
  }

  /**
   * What its speed is multiplied by: the stronger of a curse's slow and a
   * hit's slow.
   * @param now The game clock.
   * @returns The multiplier.
   */
  slowFactor(now: number): number {
    return Math.min(this.cursed.active(now) ? this.cursed.slow : 1, now < this.slowed.until ? this.slowed.factor : 1);
  }

  /**
   * Its status bits: what's afflicting it right now.
   * @returns The STATUS_ bits.
   */
  status(): number {
    const now = this._ctx.now;
    let bits = super.status();
    if (this.burning.active(now)) {
      bits |= STATUS_BURNING | (this.burning.light > 0 ? STATUS_GLOWING : 0);
    }
    if (this.cursed.active(now)) {
      bits |= STATUS_CURSED;
    }
    if (this.poisoned.active(now)) {
      bits |= STATUS_POISONED;
    }
    if (now < this.pinned.until) {
      bits |= STATUS_PINNED;
    }
    if (now < this.slowed.until) {
      bits |= STATUS_SLOWED;
    }
    if (now < this.turned.until) {
      bits |= STATUS_TURNED;
    }
    if (this.bleeding.active(now)) {
      bits |= STATUS_BLEEDING;
    }
    return bits;
  }
}
