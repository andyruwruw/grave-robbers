// Packages
import { gearWear } from '@halloween/shared/skill-tree/upgrades/gear-upgrades';

// Types
import type { MatRecipe } from '@halloween/shared/crafting/material-recipes';
import type { RecipeId } from '@halloween/shared/crafting/recipes';
import type { BagItem, GearItem } from '@halloween/shared/inventory/bag-items';
import type { StructureKind } from '@halloween/shared/structures/types/structures';
import type { TreeState } from '@halloween/shared/skill-tree/types/skill-tree';

/**
 * A brand-new piece of gear or a single structure, as a recipe makes it.
 * @param recipe A gear or structure recipe.
 * @param tree The crafter's skill tree, which sets the gear's wear.
 * @returns The item.
 */
export function freshItem(recipe: Exclude<RecipeId, MatRecipe>, tree: TreeState): BagItem {
  const [kind, what] = recipe.split(':');
  if (kind === 'gear') {
    const gear = what as GearItem['kind'];
    return { kind: gear, wear: gearWear(gear, tree) };
  }
  return { build: what as StructureKind, count: 1 };
}
