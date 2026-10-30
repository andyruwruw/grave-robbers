// Local Imports
import { roundTo } from '../../helpers/math';
import { WeaponPerk } from './weapon-perk';

// Types
import type { Rounding } from '../../helpers/types/rounding';
import type { NumericWeaponStat, WeaponStats } from '../types/weapon-stats';

/**
 * A perk that scales one stat by a share per level: the stat becomes
 * `base * (1 + perLevel * level)`, rounded. A negative share shrinks it
 * (a shorter cooldown or draw).
 */
export class ScaledPerk extends WeaponPerk {
  /**
   * The stat it scales.
   */
  private readonly _field: NumericWeaponStat;

  /**
   * The share of the base it adds per level (negative to take off).
   */
  private readonly _perLevel: number;

  /**
   * How finely the result is rounded.
   */
  private readonly _rounding: Rounding;

  /**
   * Names the perk and the stat it scales.
   * @param name The perk's name.
   * @param effect What each upgrade does.
   * @param field The stat it scales.
   * @param perLevel The share of the base it adds per level (negative to take off).
   * @param rounding How finely the result is rounded.
   */
  constructor(name: string, effect: string, field: NumericWeaponStat, perLevel: number, rounding: Rounding) {
    super(name, effect);
    this._field = field;
    this._perLevel = perLevel;
    this._rounding = rounding;
  }

  /**
   * Sets the stat to the base scaled by the level.
   * @param stats The stats being built (a copy of `base`), changed in place.
   * @param base The weapon's stats before any upgrade.
   * @param level The weapon's upgrade level.
   */
  override apply(stats: WeaponStats, base: WeaponStats, level: number): void {
    stats[this._field] = roundTo(base[this._field]! * (1 + this._perLevel * level), this._rounding);
  }
}
