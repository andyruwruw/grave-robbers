// Local Imports
import { levelOf, nodeDepth } from './progress';

// Types
import type { Inventory } from '../goods/goods';
import type { NodeId, TreeState } from './types/skill-tree';

/**
 * Upgrades a node takes, and the candy and blood each one costs at the top
 * of the tree (index = the level it's going from). Deeper nodes cost
 * DEPTH_SCALE more per step down (see `nodeDepth`), so the last unlocks
 * take commitment without running away.
 */
export const MAX_UPGRADE_LEVEL = 3;

/**
 * Candy and blood each upgrade costs at the top of the tree, by the level it's
 * going from.
 */
export const UPGRADE_COSTS: Inventory[] = [{ candy: 4, blood: 1 }, { candy: 9, blood: 3 }, { candy: 16, blood: 6 }];

/**
 * How much more each upgrade costs per step down the tree.
 */
export const DEPTH_SCALE = 0.35;

/**
 * Upgrades work anywhere; standing within RESEARCH_RADIUS of a research
 * table takes RESEARCH_DISCOUNT off, plus RESEARCH_DISCOUNT_PER_LEVEL per
 * level of the best table in reach (its builder's level).
 */
export const RESEARCH_RADIUS = 2.5;

/**
 * Share a research table in reach takes off upgrades at level 0.
 */
export const RESEARCH_DISCOUNT = 0.25;

/**
 * More share it takes off per level of the table.
 */
export const RESEARCH_DISCOUNT_PER_LEVEL = 0.1;

/**
 * The share taken off upgrades by a research table at `level` (null: none
 * in reach).
 *
 * @param level The best table's level, or null for none in reach.
 * @returns The share taken off.
 */
export function researchDiscount(level: number | null): number {
  return level === null ? 0 : RESEARCH_DISCOUNT + RESEARCH_DISCOUNT_PER_LEVEL * level;
}

/**
 * Candy and blood the next upgrade of `id` costs (scaled by its depth,
 * less `discount` from a research table), or null when it's maxed.
 *
 * @param id The node.
 * @param tree The player's progress.
 * @param discount The share taken off (see `researchDiscount`).
 * @returns The cost, or null when maxed.
 */
export function upgradeCost(id: NodeId, tree: TreeState, discount = 0): Inventory | null {
  const level = levelOf(id, tree);
  if (level >= MAX_UPGRADE_LEVEL) {
    return null;
  }
  const scale = (1 + DEPTH_SCALE * (nodeDepth(id) - 1)) * (1 - discount);
  const base = UPGRADE_COSTS[level];
  return { candy: Math.ceil(base.candy * scale), blood: Math.max(1, Math.ceil(base.blood * scale)) };
}
