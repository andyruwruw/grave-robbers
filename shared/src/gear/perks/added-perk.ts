// Local Imports
import { roundTo } from '../../helpers/math';
import { WeaponPerk } from './weapon-perk';

// Types
import type { Rounding } from '../../helpers/types/rounding';
import type { NumericWeaponStat, WeaponStats } from '../types/weapon-stats';

/**
 * A perk that adds a fixed amount to one stat per level: the stat becomes
 * `base + perLevel * level`, rounded. A negative amount takes off.
 */
export class AddedPerk extends WeaponPerk {
  /**
   * The stat it adds to.
   */
  private readonly _field: NumericWeaponStat;

  /**
   * How much it adds per level (negative to take off).
   */
  private readonly _perLevel: number;

  /**
   * How finely the result is rounded.
   */
  private readonly _rounding: Rounding;

  /**
   * Names the perk and the stat it adds to.
   * @param name The perk's name.
   * @param effect What each upgrade does.
   * @param field The stat it adds to.
   * @param perLevel How much it adds per level (negative to take off).
   * @param rounding How finely the result is rounded.
   */
  constructor(name: string, effect: string, field: NumericWeaponStat, perLevel: number, rounding: Rounding) {
    super(name, effect);
    this._field = field;
    this._perLevel = perLevel;
    this._rounding = rounding;
  }

  /**
   * Sets the stat to the base plus the level's amount.
   * @param stats The stats being built (a copy of `base`), changed in place.
   * @param base The weapon's stats before any upgrade.
   * @param level The weapon's upgrade level.
   */
  override apply(stats: WeaponStats, base: WeaponStats, level: number): void {
    stats[this._field] = roundTo(base[this._field]! + this._perLevel * level, this._rounding);
  }
}
