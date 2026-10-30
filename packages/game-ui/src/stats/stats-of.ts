// Packages
import { isMatRecipe } from '@halloween/shared/crafting/material-recipes';
import { GEAR } from '@halloween/shared/gear/gear-catalog';
import { levelOf } from '@halloween/shared/skill-tree/progress';

// Local Imports
import { GearLightStatSheet } from './gear-light-stat-sheet';
import { GuardStatSheet } from './guard-stat-sheet';
import { StructureStatSheet } from './structure-stat-sheet';
import { WeaponStatSheet } from './weapon-stat-sheet';

// Types
import type { RecipeId } from '@halloween/shared/crafting/recipes';
import type { GearKind } from '@halloween/shared/gear/types/gear-def';
import type { StructureKind } from '@halloween/shared/structures/types/structures';
import type { TreeState } from '@halloween/shared/skill-tree/types/skill-tree';
import type { Stat } from '../types/stats';

/**
 * The stat bars for a recipe at the player's level.
 *
 * @param recipe - The recipe.
 * @param tree - The player's skill tree.
 * @returns A fresh list of stats (none for materials).
 */
export function statsOf(recipe: RecipeId, tree: TreeState): Stat[] {
  if (isMatRecipe(recipe)) {
    return [];
  }
  const level = levelOf(recipe, tree);
  if (recipe.startsWith('gear:')) {
    const kind = recipe.slice(5) as GearKind;
    const def = GEAR[kind];
    if (def.weapon) {
      return new WeaponStatSheet(kind, tree, level).stats();
    }
    if (def.guard) {
      return new GuardStatSheet(kind, tree, level).stats();
    }
    return new GearLightStatSheet(kind, tree, level).stats();
  }
  return new StructureStatSheet(recipe.slice(6) as StructureKind, tree, level).stats();
}
