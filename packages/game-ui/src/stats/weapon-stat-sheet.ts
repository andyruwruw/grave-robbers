// Packages
import { wearsOut } from '@halloween/shared/gear/gear-catalog';
import { gearWear, weaponStats } from '@halloween/shared/skill-tree/upgrades/gear-upgrades';

// Local Imports
import {
  STAT_MAX_CHOP,
  STAT_MAX_DAMAGE,
  STAT_MAX_HITS,
  STAT_MAX_KNOCKBACK,
  STAT_MAX_REACH,
  STAT_MAX_SPEED,
} from '../config/stat-scales';
import { StatSheet } from './stat-sheet';

// Types
import type { GearKind } from '@halloween/shared/gear/types/gear-def';
import type { Infusion } from '@halloween/shared/gear/types/infusion';
import type { TreeState } from '@halloween/shared/skill-tree/types/skill-tree';
import type { Stat } from '../types/stats';

/**
 * A weapon's bars: damage, swing speed, reach, knockback, and gathering and
 * wear where it has them, with its infusion's changes when it has one.
 */
export class WeaponStatSheet extends StatSheet {
  /**
   * Makes a sheet for one weapon.
   *
   * @param _kind - The weapon.
   * @param tree - The player's skill tree.
   * @param level - The weapon's upgrade level.
   * @param _infusion - Its infusion, if any.
   */
  constructor(
    private readonly _kind: GearKind,
    tree: TreeState,
    level: number,
    private readonly _infusion: Infusion | null = null,
  ) {
    super(tree, level);
  }

  /**
   * The weapon's bars.
   *
   * @returns A fresh list of stats.
   */
  stats(): Stat[] {
    const kind = this._kind;
    const w = weaponStats(kind, this._tree, this._infusion);
    return [
      { icon: 'damage', color: 'red', label: 'Damage', fill: w.damage / STAT_MAX_DAMAGE },
      { icon: 'speed', color: 'yellow', label: 'Swing speed', fill: 1 / w.cooldown / STAT_MAX_SPEED },
      { icon: 'reach', color: 'blue', label: 'Reach', fill: w.reach / STAT_MAX_REACH },
      { icon: 'knockback', color: 'sky', label: 'Knockback', fill: w.knockback / STAT_MAX_KNOCKBACK },
      ...(w.chop ? [{ icon: 'gathering' as const, color: 'brown' as const, label: 'Gathering', fill: w.chop / STAT_MAX_CHOP }] : []),
      ...(wearsOut(kind) ? [{ icon: 'lasts' as const, color: 'tan' as const, label: 'Lasts (hits)', fill: gearWear(kind, this._tree) / STAT_MAX_HITS }] : []),
    ];
  }
}
