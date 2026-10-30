// Packages
import { Flame, Sun } from 'lucide-react';
import { GEAR } from '@halloween/shared/gear/gear-catalog';
import { lightIntensity, lightRadius } from '@halloween/shared/skill-tree/upgrades/structure-upgrades';

// Local Imports
import { STAT_MAX_BRIGHTNESS, STAT_MAX_RADIUS } from '../config/stat-scales';
import { StatSheet } from './stat-sheet';

// Types
import type { GearKind } from '@halloween/shared/gear/types/gear-def';
import type { TreeState } from '@halloween/shared/skill-tree/types/skill-tree';
import type { Stat } from '../types/stats';

/**
 * The bars for gear that is neither weapon nor guard: its light and
 * brightness.
 */
export class GearLightStatSheet extends StatSheet {
  /**
   * Makes a sheet for one piece of gear.
   *
   * @param _kind - The gear.
   * @param tree - The player's skill tree.
   * @param level - The gear's upgrade level.
   */
  constructor(
    private readonly _kind: GearKind,
    tree: TreeState,
    level: number,
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
    return [
      { icon: Sun, label: 'Light', fill: lightRadius(def.light?.radius ?? 0, this._level) / STAT_MAX_RADIUS },
      { icon: Flame, label: 'Brightness', fill: lightIntensity(def.light?.intensity, this._level) / STAT_MAX_BRIGHTNESS },
    ];
  }
}
