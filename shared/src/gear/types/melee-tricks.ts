// Types
import type { ComboStep } from './weapon-stats';

/**
 * Each weapon's trick. `crush` ignores monster armor and raised shields.
 * `cleave` adds that much damage to each hit for every other monster
 * caught in the same swing.
 * `stun` is the chance a hit leaves a monster (not a brute) dazed for
 * STUN_SECONDS, frozen and out of its attack.
 * `stagger` is the chance a hit knocks a monster (not a brute) out of
 * the attack it's winding up. `bruteBane` multiplies damage to brutes,
 * and knockback moves them. `bleed` is damage a second a wound keeps
 * doing for BLEED_SECONDS. `execute` multiplies damage to anything
 * under half health. `harvest` is extra blood per kill. `tip` multiplies
 * damage to targets past TIP_FROM of its reach. `deflect` multiplies
 * damage from the front while it's held (no shield needed).
 */
export interface MeleeTricks {
  /**
   * Ignores monster armor and raised shields.
   */
  crush?: boolean;

  /**
   * Damage added to each hit for every other monster caught in the same swing.
   */
  cleave?: number;

  /**
   * A stab: hits only what's within this many tiles either side of a
   * straight line ahead (out to `reach`), instead of an arc.
   */
  line?: number;

  /**
   * A combo: each swing in a row (within COMBO_WINDOW of the last) takes
   * the next step, hitting `mult` times as hard, as a stab (`line`) instead
   * of an arc, or `reach` further; then it starts over. `charge` is how
   * many landed hits charge a spiked gauntlet's super uppercut.
   */
  combo?: ComboStep[];

  /**
   * Landed hits that charge a spiked gauntlet's super uppercut.
   */
  charge?: number;

  /**
   * Chance a hit leaves a monster (not a brute) dazed for STUN_SECONDS.
   */
  stun?: number;

  /**
   * Chance a hit knocks a monster (not a brute) out of the attack it's winding
   * up.
   */
  stagger?: number;

  /**
   * Multiplies damage to brutes (and knockback moves them).
   */
  bruteBane?: number;

  /**
   * Damage a second a wound keeps doing for BLEED_SECONDS.
   */
  bleed?: number;

  /**
   * Multiplies damage to anything under half health.
   */
  execute?: number;

  /**
   * Extra blood per kill.
   */
  harvest?: number;

  /**
   * A wrench's share of a structure's full health one swing mends (see
   * `RepairJob`).
   */
  repair?: number;

  /**
   * Multiplies damage to targets past TIP_FROM of its reach.
   */
  tip?: number;

  /**
   * Multiplies damage from the front while it's held (no shield needed).
   */
  deflect?: number;
}
