// Packages
import { useRef, useState } from 'react';
import { MAX_CRAFT, craftCost, needsAnvil, recipeParts } from '@halloween/shared/crafting/recipes';
import { affordableCount, partsCount } from '@halloween/shared/inventory/affordability';
import { recipeUnlocked } from '@halloween/shared/skill-tree/progress';
import { useHold } from '@halloween/ui/hooks/use-hold';

// Local Imports
import { DOUBLE_TAP_MS } from '../config/item-details';

// Types
import type { RecipeId } from '@halloween/shared/crafting/recipes';
import type { Gear } from '@halloween/shared/inventory/bag-items';
import type { Inventory } from '@halloween/shared/goods/goods';
import type { TreeState } from '@halloween/shared/skill-tree/types/skill-tree';

/**
 * What `useCraftSelection` hands back.
 */
interface CraftSelection {
  /**
   * The recipe whose details show as a dialog, or null.
   */
  details: RecipeId | null;

  /**
   * Hides the details dialog.
   */
  closeDetails: () => void;

  /**
   * Whether locked recipes show as lock tiles.
   */
  showLocked: boolean;

  /**
   * Turns showing locked recipes on or off.
   */
  setShowLocked: (show: boolean) => void;

  /**
   * The recipe picked for the craft bar, or null.
   */
  selected: RecipeId | null;

  /**
   * A tap on a recipe: picks it for the craft bar, starting at one; a
   * second tap on it within DOUBLE_TAP_MS opens its details (unless they
   * show beside the list).
   */
  tap: (recipe: RecipeId) => void;

  /**
   * Sets how many to craft.
   */
  setCount: (count: number) => void;

  /**
   * The long-press handling for recipe tiles.
   */
  hold: ReturnType<typeof useHold<RecipeId>>;

  /**
   * How many of a recipe can be made now (0 when locked or out of reach).
   */
  canMake: (recipe: RecipeId) => number;

  /**
   * How many of the selected recipe can be made.
   */
  most: number;

  /**
   * How many of the selected recipe will be crafted.
   */
  amount: number;
}

/**
 * The craft page's picking: which recipe is selected and how many, whether
 * locked ones show, and which one's details are open.
 *
 * @param aside - Whether details show beside the list (a hold selects).
 * @param tree - The player's skill tree.
 * @param inventory - Candy and blood carried.
 * @param gear - The bag, whose material stacks pay for crafting.
 * @param anvil - The level of the anvil in reach, null without one.
 * @returns The selection and what follows from it.
 */
export function useCraftSelection(aside: boolean, tree: TreeState, inventory: Inventory, gear: Gear, anvil: number | null): CraftSelection {
  const [details, setDetails] = useState<RecipeId | null>(null);
  const [showLocked, setShowLocked] = useState(false);
  const [selected, setSelected] = useState<RecipeId | null>(null);
  const [count, setCount] = useState(1);
  const lastTap = useRef<{ recipe: RecipeId; at: number } | null>(null);
  const hold = useHold<RecipeId>((recipe: RecipeId): void => {
    if (aside) {
      setSelected(recipe);
      setCount(1);
    } else {
      setDetails(recipe);
    }
  });

  /**
   * How many of a recipe can be made now.
   *
   * @param recipe - The recipe.
   * @returns Up to `MAX_CRAFT`, 0 when locked or needing a missing anvil.
   */
  const canMake = (recipe: RecipeId): number => (!recipeUnlocked(recipe, tree) || (needsAnvil(recipe) && anvil === null && !tree.free) ? 0 : tree.free ? MAX_CRAFT : Math.min(affordableCount(craftCost(recipe, anvil), inventory, gear.bag, MAX_CRAFT), partsCount(recipeParts(recipe), gear.bag)));
  const most = selected ? canMake(selected) : 0;
  const amount = Math.max(1, Math.min(count, most));

  /**
   * Picks a recipe for the craft bar, and opens its details on a double
   * tap.
   *
   * @param recipe - The recipe.
   */
  const tap = (recipe: RecipeId): void => {
    const now = performance.now();
    const last = lastTap.current;
    lastTap.current = { recipe, at: now };
    if (!aside && last?.recipe === recipe && now - last.at <= DOUBLE_TAP_MS) {
      lastTap.current = null;
      setDetails(recipe);
    }
    if (recipe !== selected) {
      setSelected(recipe);
      setCount(1);
    }
  };

  return { details, closeDetails: (): void => setDetails(null), showLocked, setShowLocked, selected, tap, setCount, hold, canMake, most, amount };
}
