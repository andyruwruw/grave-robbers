// Local Imports
import { GEAR, GEAR_KINDS } from '../gear/gear-catalog';
import { ANVIL_DISCOUNT_PER_LEVEL } from '../structures/stations';
import { STRUCTURES, STRUCTURE_KINDS } from '../structures/structure-catalog';
import { MAT_RECIPES, MAT_RECIPE_IDS, isMatRecipe } from './material-recipes';

// Types
import type { GearKind } from '../gear/types/gear-def';
import type { Bundle } from '../goods/goods';
import type { CraftKey } from '../inventory/item-keys';
import type { StructureKind } from '../structures/types/structures';
import type { MatRecipe } from './material-recipes';

/**
 * Everything the Craft list makes: a stack of a material, a piece of
 * gear, or a structure (which goes into the bag, to be placed from there).
 */
export type RecipeId = MatRecipe | CraftKey;

/**
 * Most of one thing a single Craft press makes (the phone's count cap and
 * the server's).
 */
export const MAX_CRAFT = 99;

/**
 * Every recipe, in Craft list order: the material recipes, then craftable
 * gear, then structures.
 */
export const RECIPES: RecipeId[] = [
  ...MAT_RECIPE_IDS,
  ...GEAR_KINDS.filter((k: GearKind): boolean => !GEAR[k].junk && !GEAR[k].innate).map((k: GearKind): RecipeId => `gear:${k}`),
  ...STRUCTURE_KINDS.filter((k: StructureKind): boolean => !STRUCTURES[k].wild).map((k: StructureKind): RecipeId => `build:${k}`),
];

/**
 * What a recipe costs to craft, before an anvil's discount.
 *
 * @param id The recipe.
 * @returns Its cost.
 */
export function recipeCost(id: RecipeId): Bundle {
  if (isMatRecipe(id)) {
    return MAT_RECIPES[id].cost;
  }
  const [kind, what] = id.split(':') as ['gear', GearKind] | ['build', StructureKind];
  return kind === 'gear' ? GEAR[what].cost : STRUCTURES[what].cost;
}

/**
 * Whether a recipe is only crafted beside an anvil.
 *
 * @param id The recipe.
 * @returns True for anvil recipes.
 */
export function needsAnvil(id: RecipeId): boolean {
  if (isMatRecipe(id)) {
    return !!MAT_RECIPES[id].anvil;
  }
  return id.startsWith('gear:') ? !!GEAR[id.slice(5) as GearKind].anvil : !!STRUCTURES[id.slice(6) as StructureKind].anvil;
}

/**
 * What a recipe costs crafted beside an anvil of `anvil` level (null: no
 * anvil in reach): anvil recipes' materials drop ANVIL_DISCOUNT_PER_LEVEL
 * a level, rounded up.
 *
 * @param id The recipe.
 * @param anvil The level of the best anvil in reach, or null for none.
 * @returns The cost after the discount.
 */
export function craftCost(id: RecipeId, anvil: number | null): Bundle {
  const cost = recipeCost(id);
  if (!needsAnvil(id) || !anvil) {
    return cost;
  }
  const keep = Math.max(0, 1 - ANVIL_DISCOUNT_PER_LEVEL * anvil);
  return Object.fromEntries(Object.entries(cost).map(([g, n]): [string, number] => [g, Math.ceil(n * keep)])) as Bundle;
}
