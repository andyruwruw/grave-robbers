// Types
import type { TreeState } from '@halloween/shared/skill-tree/types/skill-tree';
import type { Stat } from '../types/stats';

/**
 * The stat bars for one kind of recipe at the player's level.
 */
export abstract class StatSheet {
  /**
   * Makes a sheet.
   *
   * @param _tree - The player's skill tree.
   * @param _level - The recipe's upgrade level.
   */
  constructor(
    protected readonly _tree: TreeState,
    protected readonly _level: number,
  ) {}

  /**
   * The bars, in the order they show.
   *
   * @returns A fresh list of stats.
   */
  abstract stats(): Stat[];
}
