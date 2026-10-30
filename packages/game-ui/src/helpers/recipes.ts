// Packages
import { MAT_RECIPES, ammoMade, isMatRecipe } from '@halloween/shared/crafting/material-recipes';
import { itemLabel } from '@halloween/shared/inventory/item-keys';
import { GOODS_LABELS } from '@halloween/shared/goods/goods-display';
import { TREE_NODE } from '@halloween/shared/skill-tree/nodes';
import { nodeDepth } from '@halloween/shared/skill-tree/progress';

// Types
import type { MatRecipe } from '@halloween/shared/crafting/material-recipes';
import type { RecipeId } from '@halloween/shared/crafting/recipes';
import type { ItemKey } from '@halloween/shared/inventory/item-keys';
import type { Branch } from '@halloween/shared/skill-tree/types/skill-tree';

/**
 * Each recipe's category: its skill tree branch (ammo goes with weapons).
 *
 * @param recipe - The recipe.
 * @returns Its branch.
 */
export function branchOf(recipe: RecipeId): Branch {
  if (isMatRecipe(recipe)) {
    const opens = MAT_RECIPES[recipe].opens;
    return opens ? TREE_NODE[opens].branch : 'weapons';
  }
  return TREE_NODE[recipe].branch;
}

/**
 * How deep in the skill tree a recipe sits (ammo goes with its weapon), for
 * ordering each category by tier, then alphabetically.
 *
 * @param recipe - The recipe.
 * @returns Its depth in the tree.
 */
export function tierOf(recipe: RecipeId): number {
  if (isMatRecipe(recipe)) {
    return nodeDepth(recipe === 'arrows' ? 'mat:arrows' : recipe === 'bolts' ? 'gear:crossbow' : MAT_RECIPES[recipe].opens!);
  }
  return nodeDepth(recipe);
}

/**
 * The name a recipe is sorted by within its tier.
 *
 * @param recipe - The recipe.
 * @returns Its plain name.
 */
export function sortName(recipe: RecipeId): string {
  return isMatRecipe(recipe) ? GOODS_LABELS[recipe] : itemLabel(recipe);
}

/**
 * What a recipe is called: a material by the bundle one craft makes.
 *
 * @param recipe - The recipe.
 * @returns Its display name.
 */
export function recipeName(recipe: RecipeId): string {
  if (!isMatRecipe(recipe)) {
    return itemLabel(recipe);
  }
  return ammoMade(recipe) > 1 ? `${ammoMade(recipe)} ${GOODS_LABELS[recipe].toLowerCase()}` : GOODS_LABELS[recipe];
}

/**
 * The recipe that makes an item, if any: a craftable material's own recipe,
 * null for any other material, and the item itself otherwise.
 *
 * @param item - Something craftable, or anything a bag can hold.
 * @returns Its recipe, or null.
 */
export const recipeOf = (item: RecipeId | ItemKey): RecipeId | null => (item.startsWith('mat:') ? (isMatRecipe(item.slice(4)) ? item.slice(4) as MatRecipe : null) : item as RecipeId);
