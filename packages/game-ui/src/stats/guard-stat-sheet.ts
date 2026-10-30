// Packages
import { ShieldHalf } from 'lucide-react';
import { gearGuard } from '@halloween/shared/skill-tree/upgrades/gear-upgrades';

// Local Imports
import { StatSheet } from './stat-sheet';

// Types
import type { GearKind } from '@halloween/shared/gear/types/gear-def';
import type { TreeState } from '@halloween/shared/skill-tree/types/skill-tree';
import type { Stat } from '../types/stats';

/**
 * A guard's one bar: how much damage it blocks.
 */
export class GuardStatSheet extends StatSheet {
  /**
   * Makes a sheet for one guard.
   *
   * @param _kind - The guard.
   * @param tree - The player's skill tree.
   * @param level - The guard's upgrade level.
   */
  constructor(
    private readonly _kind: GearKind,
    tree: TreeState,
    level: number,
  ) {
    super(tree, level);
  }

  /**
   * The guard's bar.
   *
   * @returns A fresh list of stats.
   */
  stats(): Stat[] {
    return [
      { icon: ShieldHalf, label: 'Damage blocked', fill: (1 - gearGuard(this._kind, this._tree)) / 0.75 },
    ];
  }
}
