// Local Imports
import { stock } from '../goods/goods';

// Types
import type { Bundle } from '../goods/goods';
import type { CraftKey } from '../inventory/item-keys';

/**
 * Recipes that make a stack of a material: ammo, parts forged at an anvil
 * (chain, cursed cores), and the blood watering can. `opens` is the node
 * whose unlock opens the recipe (none: known from the start).
 */
export type MatRecipe = 'arrows' | 'bolts' | 'chain' | 'cursed-core' | 'watering-can';

/**
 * One material recipe.
 */
export interface MatRecipeDef {
  /**
   * What one craft costs.
   */
  cost: Bundle;

  /**
   * How many of the material one craft makes.
   */
  makes: number;

  /**
   * The node whose unlock opens the recipe (none: known from the start).
   */
  opens?: CraftKey;

  /**
   * Only crafted within ANVIL_RADIUS of an anvil.
   */
  anvil?: boolean;
}

/**
 * Every material recipe (key order is the Craft list's order).
 */
export const MAT_RECIPES: Record<MatRecipe, MatRecipeDef> = {
  'arrows': { cost: stock({ wood: 1 }), makes: 4 },
  'bolts': { cost: stock({ wood: 1 }), makes: 3 },
  'chain': { cost: stock({ iron: 2 }), makes: 1, opens: 'build:anvil', anvil: true },
  'cursed-core': { cost: stock({ bloodsteel: 1, silver: 1 }), makes: 1, opens: 'build:anvil', anvil: true },
  'watering-can': { cost: stock({ iron: 2, bone: 1 }), makes: 1, opens: 'build:oven' },
};

/**
 * Every material recipe's id, in MAT_RECIPES order.
 */
export const MAT_RECIPE_IDS = Object.keys(MAT_RECIPES) as MatRecipe[];

/**
 * Whether a recipe id is a material recipe.
 *
 * @param id Any recipe id.
 * @returns True when it names a MatRecipe.
 */
export function isMatRecipe(id: string): id is MatRecipe {
  return id in MAT_RECIPES;
}

/**
 * How many of its material one craft of a material recipe makes.
 *
 * @param recipe The material recipe.
 * @returns How many it makes.
 */
export function ammoMade(recipe: MatRecipe): number {
  return MAT_RECIPES[recipe].makes;
}
