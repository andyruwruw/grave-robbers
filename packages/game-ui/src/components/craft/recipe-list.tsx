// Packages
import React from 'react';
import { RECIPES } from '@halloween/shared/crafting/recipes';
import { BRANCHES } from '@halloween/shared/skill-tree/branches';
import { recipeUnlocked } from '@halloween/shared/skill-tree/progress';

// Local Imports
import { branchOf, sortName, tierOf } from '../../helpers/recipes';
import RecipeTile from './recipe-tile';

// Types
import type { RecipeId } from '@halloween/shared/crafting/recipes';
import type { Branch, TreeState } from '@halloween/shared/skill-tree/types/skill-tree';
import type { HoldProps } from '@halloween/ui/hooks/use-hold';

/**
 * Props for the RecipeList component.
 */
interface RecipeListProps {
  /**
   * The player's skill tree.
   */
  tree: TreeState;

  /**
   * Whether locked recipes show as lock tiles.
   */
  showLocked: boolean;

  /**
   * The recipe picked for the craft bar, or null.
   */
  selected: RecipeId | null;

  /**
   * How many of a recipe can be made now.
   */
  canMake: (recipe: RecipeId) => number;

  /**
   * The long-press handlers for one recipe.
   */
  bindHold: (recipe: RecipeId) => HoldProps;

  /**
   * Called when a recipe is clicked.
   */
  onTap: (recipe: RecipeId) => void;
}

/**
 * Everything that can be made, by branch, each sorted by tier then name,
 * as a grid of square tiles.
 *
 * @param {RecipeListProps} props - Component props.
 * @returns {React.JSX.Element} The rendered list.
 */
function RecipeList({
  tree,
  showLocked,
  selected,
  canMake,
  bindHold,
  onTap,
}: RecipeListProps): React.JSX.Element {
  return (
    <>
      {BRANCHES.map(({ id, label }: { id: Branch; label: string }) => {
        const recipes = RECIPES.filter((r: RecipeId): boolean => branchOf(r) === id && (showLocked || recipeUnlocked(r, tree)))
          .sort((x: RecipeId, y: RecipeId): number => tierOf(x) - tierOf(y) || sortName(x).localeCompare(sortName(y)));
        if (recipes.length === 0) {
          return null;
        }
        return (
          <div
            key={id}
            className='flex flex-col gap-1'>
            <span className='font-medium text-xs text-foreground-muted'>{label}</span>
            <div className='grid w-full grid-cols-6 gap-1'>
              {recipes.map((recipe: RecipeId) => (
                <RecipeTile
                  key={recipe}
                  recipe={recipe}
                  open={recipeUnlocked(recipe, tree)}
                  affordable={canMake(recipe) > 0}
                  selected={selected === recipe}
                  hold={bindHold(recipe)}
                  onClick={(): void => onTap(recipe)} />
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}

export default RecipeList;
