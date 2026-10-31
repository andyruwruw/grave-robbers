// Packages
import React, { useState } from 'react';
import { MAX_UPGRADE_LEVEL } from '@halloween/shared/skill-tree/upgrade-cost';
import { TREE_NODE } from '@halloween/shared/skill-tree/nodes';
import { levelOf } from '@halloween/shared/skill-tree/progress';
import RecipeList from '@halloween/game-ui/components/craft/recipe-list';
import ItemDetails from '@halloween/game-ui/components/item-details/item-details';

// Types
import type { RecipeId } from '@halloween/shared/crafting/recipes';
import type { Inventory } from '@halloween/shared/goods/goods';
import type { NodeId, TreeState } from '@halloween/shared/skill-tree/types/skill-tree';
import type { HoldProps } from '@halloween/ui/hooks/use-hold';

/**
 * Nothing carried, so costs show against an empty wallet.
 */
const NOTHING: Inventory = { candy: 0, blood: 0 };

/**
 * The skill tree node behind a recipe's level, or null when it has none.
 *
 * @param recipe The recipe.
 * @returns Its node, or null.
 */
function nodeOf(recipe: RecipeId): NodeId | null {
  if (recipe === 'arrows') {
    return 'mat:arrows';
  }
  return TREE_NODE[recipe as NodeId] ? recipe as NodeId : null;
}

/**
 * Everything that can be made, every recipe open, with the picked one's
 * details beside the list, for looking at only: nothing is crafted. Its
 * own skill tree (never sent anywhere) holds levels: left click a picked
 * item (or its details) to upgrade it, right click to downgrade, so its
 * stats and costs show at each level.
 *
 * @returns {React.JSX.Element} The rendered catalog.
 */
function CatalogPanel(): React.JSX.Element {
  const [selected, setSelected] = useState<RecipeId | null>(null);
  const [tree, setTree] = useState<TreeState>({ found: [], levels: {}, all: true });

  /**
   * Moves a recipe's level up or down a step, within 0 to the most.
   *
   * @param recipe The recipe.
   * @param step +1 or -1.
   */
  const shift = (recipe: RecipeId, step: number): void => {
    const node = nodeOf(recipe);
    if (!node) {
      return;
    }
    setTree((prev: TreeState): TreeState => {
      const level = Math.min(MAX_UPGRADE_LEVEL, Math.max(0, levelOf(node, prev) + step));
      return { ...prev, levels: { ...prev.levels, [node]: level } };
    });
  };

  /**
   * Right clicking a tile picks it and takes it down a level.
   *
   * @param recipe The tile's recipe.
   * @returns The tile's extra handlers.
   */
  const bindTile = (recipe: RecipeId): HoldProps => ({
    onContextMenu: (e: React.MouseEvent): void => {
      e.preventDefault();
      setSelected(recipe);
      shift(recipe, -1);
    },
  });

  return (
    <div className='flex min-h-0 flex-1 flex-col gap-md'>
      <span className='text-xs text-foreground-subtle'>Left click a picked item to upgrade it, right click to downgrade. Nothing is crafted.</span>
      <div className='flex min-h-0 flex-1 flex-col gap-md md:flex-row'>
        <div className='scrollbar-none flex min-h-0 flex-1 flex-col gap-sm overflow-y-auto md:w-[400px] md:flex-none'>
          <RecipeList
            tree={tree}
            showLocked={false}
            selected={selected}
            canMake={(): number => 1}
            bindHold={bindTile}
            onTap={(recipe: RecipeId): void => {
              if (recipe === selected) {
                shift(recipe, 1);
              }
              setSelected(recipe);
            }} />
        </div>
        {selected && (
          <div
            className='flex min-h-0 flex-1 flex-col'
            onClick={(): void => shift(selected, 1)}
            onContextMenu={(e: React.MouseEvent): void => {
              e.preventDefault();
              shift(selected, -1);
            }}>
            <ItemDetails
              inline
              item={selected}
              tree={tree}
              inventory={NOTHING}
              bag={[]} />
          </div>
        )}
      </div>
    </div>
  );
}

export default CatalogPanel;
