// Packages
import { GEAR } from '@halloween/shared/gear/gear-catalog';
import { variantOf } from '@halloween/shared/gear/infusions/helpers/infusion-paths';
import { lightIntensity, lightRadius } from '@halloween/shared/skill-tree/upgrades/structure-upgrades';

// Local Imports
import { STAT_MAX_BRIGHTNESS, STAT_MAX_RADIUS } from '../config/stat-scales';
import { StatSheet } from './stat-sheet';

// Types
import type { GearKind } from '@halloween/shared/gear/types/gear-def';
import type { Infusion } from '@halloween/shared/gear/types/infusion';
import type { TreeState } from '@halloween/shared/skill-tree/types/skill-tree';
import type { Stat } from '../types/stats';

/**
 * The bars for gear that is neither weapon nor guard: its light (farther
 * for a Brimstone Torch, `lightMult`) and brightness.
 */
export class GearLightStatSheet extends StatSheet {
  /**
   * Makes a sheet for one piece of gear.
   *
   * @param _kind - The gear.
   * @param tree - The player's skill tree.
   * @param level - The gear's upgrade level.
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
   * The gear's bars.
   *
   * @returns A fresh list of stats.
   */
  stats(): Stat[] {
    const def = GEAR[this._kind];
    const reach = variantOf(this._kind, this._infusion)?.twist.lightMult ?? 1;
    return [
      { icon: 'light', color: 'sun', label: 'Light', fill: lightRadius(def.light?.radius ?? 0, this._level) * reach / STAT_MAX_RADIUS },
      { icon: 'flame', color: 'orange', label: 'Brightness', fill: lightIntensity(def.light?.intensity, this._level) / STAT_MAX_BRIGHTNESS },
    ];
  }
}
