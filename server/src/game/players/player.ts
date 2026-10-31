// Packages
import { twoHanded } from '@halloween/shared/gear/gear-catalog';
import { MAX_HP, SPAWN_PROTECTION } from '@halloween/shared/players/health';

// Local Imports
import { PlayerFighter } from './player-fighter';

// Types
import type { PlayerState } from '@halloween/shared/protocol/state/player-state';
import type { PlayerInit } from '../types/players';

/**
 * Server-side player: public state plus the secret token, live input, what
 * they carry, and combat timers (all in game-clock seconds). This layer is
 * their health and death.
 */
export class Player extends PlayerFighter implements Omit<PlayerState, 'buildStyle' | 'wounded' | 'slowed' | 'drawn' | 'digging' | 'aiming' | 'charge' | 'reloading' | 'gearInfusion'> {
  /**
   * Health, 0..MAX_HP.
   */
  hp = MAX_HP;

  /**
   * Hit counter; the display flashes the player whenever it goes up.
   */
  hurts = 0;

  /**
   * Waiting to respawn.
   */
  dead = false;

  /**
   * Under spawn protection: can't be hurt.
   */
  protected = true;

  /**
   * When spawn protection ends.
   */
  protectedUntil: number;

  /**
   * When they last came to life.
   */
  aliveSince: number;

  /**
   * When they respawn after dying.
   */
  respawnAt = 0;

  /**
   * Who or what killed them last.
   */
  killedBy = '';

  /**
   * Recent damage (when, how much), which healing can't touch until it's
   * FRESH_WOUND_SECONDS old.
   */
  wounds: { at: number; amount: number }[] = [];

  /**
   * Health still to come back from kills.
   */
  feast = 0;

  /**
   * Extra health above full from kills (Heart Devourer, Death's
   * Harvest), soaked before health.
   */
  overheal = 0;

  /**
   * When the overheal runs out (game clock): `seconds` after its last
   * top-up.
   */
  overhealUntil = 0;

  /**
   * Their glaive is out, thrown (Soulbound and Wraith Glaive): they can't
   * act until it's back (see `GlaiveSystem`).
   */
  thrown = false;

  /**
   * A kill banked a quick reload (Bone Rattler): the next reload takes the
   * weapon's `reloadOnKill` share of its time.
   */
  reloadBanked = false;

  /**
   * Until when the Hellmouth's spray is paid for (game clock): it takes
   * its next blood once this passes (see `FlameSpraySystem`).
   */
  sprayPaidUntil = 0;

  /**
   * What their phone was last told about their vitals.
   */
  vitalsKey = '';

  /**
   * Sets up a fresh player, protected for a moment.
   * @param init Who they are, where and when they start, and what they kept.
   */
  constructor(init: PlayerInit) {
    super(init);
    this.protectedUntil = init.time + SPAWN_PROTECTION;
    this.aliveSince = init.time;
  }

  /**
   * Damage too fresh to heal yet, never more than the health missing.
   * @returns The health it holds back.
   */
  wounded(): number {
    return Math.min(MAX_HP - this.hp, this.wounds.reduce((sum: number, w): number => sum + w.amount, 0));
  }

  /**
   * Takes health as a fresh wound, joining one taken in the last half
   * second, and flashes them if it cost a half heart or more.
   * @param amount The health to take.
   * @param time The game clock now.
   */
  wound(amount: number, time: number): void {
    const before = Math.ceil(this.hp);
    this.hp -= amount;
    const last = this.wounds.at(-1);
    if (last && time - last.at < 0.5) {
      last.amount += amount;
      last.at = time;
    } else {
      this.wounds.push({ at: time, amount });
    }
    if (Math.ceil(this.hp) !== before) {
      this.hurts++;
    }
  }

  /**
   * Highest they can heal to right now.
   * @returns The health cap.
   */
  healCap(): number {
    return MAX_HP - this.wounded();
  }

  /**
   * Whether they have a shield they can raise: one in the off-hand,
   * beside a one-handed weapon.
   * @returns True if they can block.
   */
  canBlock(): boolean {
    return !this.dead && this.bag.equipped.offhand?.kind === 'shield' && !twoHanded(this.bag.equipped.weapon?.kind);
  }
}
