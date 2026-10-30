// Types
import type { WeaponStats } from '../types/weapon-stats';

/**
 * One weapon's upgrade perk: its name and effect (the phone's text, see
 * `upgradeEffect`) and how each upgrade level changes the weapon's stats
 * (see `weaponStats`). The base perk changes nothing: the stake's upgrade
 * is more uses (`gearWear`), not better stats.
 */
export class WeaponPerk {
  /**
   * The perk's name, shown on the phone.
   */
  readonly name: string;

  /**
   * What each upgrade does, shown on the phone after the name.
   */
  readonly effect: string;

  /**
   * Names the perk.
   * @param name The perk's name.
   * @param effect What each upgrade does.
   */
  constructor(name: string, effect: string) {
    this.name = name;
    this.effect = effect;
  }

  /**
   * Applies the perk at a level to stats copied from `base`. The base perk
   * changes nothing.
   * @param stats The stats being built (a copy of `base`), changed in place.
   * @param base The weapon's stats before any upgrade.
   * @param level The weapon's upgrade level.
   */
  apply(stats: WeaponStats, base: WeaponStats, level: number): void {}
}
