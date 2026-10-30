// Local Imports
import { WeaponPerk } from './weapon-perk';

// Types
import type { PerkRule } from '../types/perk-rule';
import type { WeaponStats } from '../types/weapon-stats';

/**
 * A perk whose rule fits neither a scale nor an addition (the scythe's
 * harvest, the greatsword's execute, the glaive's wider sweep).
 */
export class CustomPerk extends WeaponPerk {
  /**
   * How it changes the stats.
   */
  private readonly _rule: PerkRule;

  /**
   * Names the perk and its rule.
   * @param name The perk's name.
   * @param effect What each upgrade does.
   * @param rule How it changes the stats.
   */
  constructor(name: string, effect: string, rule: PerkRule) {
    super(name, effect);
    this._rule = rule;
  }

  /**
   * Runs the rule.
   * @param stats The stats being built (a copy of `base`), changed in place.
   * @param base The weapon's stats before any upgrade.
   * @param level The weapon's upgrade level.
   */
  override apply(stats: WeaponStats, base: WeaponStats, level: number): void {
    this._rule(stats, base, level);
  }
}
