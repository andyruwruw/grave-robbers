// Types
import type { InfusionTricks } from './infusion-tricks';
import type { MeleeTricks } from './melee-tricks';
import type { RangedTricks } from './ranged-tricks';
import type { SwingStats } from './swing-stats';

/**
 * Everything about how a weapon fights: its swing (`SwingStats`), its
 * melee trick (`MeleeTricks`), for a bow, crossbow or gun, how it
 * shoots (`RangedTricks`), and what an infusion adds (`InfusionTricks`).
 */
export interface WeaponStats extends SwingStats, MeleeTricks, RangedTricks, InfusionTricks {}

/**
 * One step of a weapon's combo (see `WeaponStats.combo`).
 */
export interface ComboStep {
  /**
   * How many times as hard this step hits.
   */
  mult: number;

  /**
   * Makes this step a stab this many tiles either side of a line ahead.
   */
  line?: number;

  /**
   * Tiles further this step reaches.
   */
  reach?: number;
}

/**
 * The name of every plain number stat on a weapon: the ones an upgrade
 * perk can scale or add to (`hands`, fixed at 2, is not one).
 */
export type NumericWeaponStat = {
  [K in keyof WeaponStats]-?: number extends NonNullable<WeaponStats[K]> ? (NonNullable<WeaponStats[K]> extends number ? K : never) : never;
}[keyof WeaponStats];
