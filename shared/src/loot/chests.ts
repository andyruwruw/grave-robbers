// Types
import type { Goods } from '../goods/goods';

/**
 * One line of what a chest can hold: how likely it is and how many, both
 * growing a little with the opener's player level.
 */
export interface ChestLoot {
  /**
   * What it is.
   */
  goods: Goods;

  /**
   * The chance it's in the chest at player level 0.
   */
  chance: number;

  /**
   * Chance added per player level.
   */
  chancePerLevel: number;

  /**
   * The chance never goes past this.
   */
  maxChance: number;

  /**
   * How many at player level 0, least to most.
   */
  amount: [number, number];

  /**
   * Player levels per one more at the top of the amount (0: never grows).
   */
  levelsPerExtra: number;

  /**
   * The top of the amount never goes past this.
   */
  maxAmount: number;
}

/**
 * The highest player level a chest counts, so a strong player's chests
 * stop getting better.
 */
export const CHEST_LEVEL_CAP = 20;

/**
 * What a chest holds: only raw goods, the plain ones nearly always, the
 * rarer ones far less often and never many.
 */
export const CHEST_LOOT: ChestLoot[] = [
  { goods: 'wood', chance: 1, chancePerLevel: 0, maxChance: 1, amount: [1, 3], levelsPerExtra: 5, maxAmount: 6 },
  { goods: 'candy', chance: 1, chancePerLevel: 0, maxChance: 1, amount: [1, 4], levelsPerExtra: 7, maxAmount: 6 },
  { goods: 'stone', chance: 0.5, chancePerLevel: 0.015, maxChance: 0.8, amount: [1, 2], levelsPerExtra: 10, maxAmount: 3 },
  { goods: 'bone', chance: 0.4, chancePerLevel: 0.01, maxChance: 0.6, amount: [1, 2], levelsPerExtra: 10, maxAmount: 3 },
  { goods: 'iron', chance: 0.04, chancePerLevel: 0.008, maxChance: 0.2, amount: [1, 1], levelsPerExtra: 0, maxAmount: 1 },
  { goods: 'silver', chance: 0.01, chancePerLevel: 0.0025, maxChance: 0.06, amount: [1, 1], levelsPerExtra: 0, maxAmount: 1 },
  { goods: 'ectoplasm', chance: 0.01, chancePerLevel: 0.0015, maxChance: 0.04, amount: [1, 1], levelsPerExtra: 0, maxAmount: 1 },
];
