// Packages
import React from 'react';

// Local Imports
import { useCraftSelection } from '../../hooks/use-craft-selection';
import ItemDetails from '../item-details/item-details';
import CraftBar from './craft-bar';
import RecipeList from './recipe-list';
import ShowLockedToggle from './show-locked-toggle';

// Types
import type { RecipeId } from '@halloween/shared/crafting/recipes';
import type { Gear } from '@halloween/shared/inventory/bag-items';
import type { Inventory } from '@halloween/shared/goods/goods';
import type { TreeState } from '@halloween/shared/skill-tree/types/skill-tree';

/**
 * Props for the CraftPanel component.
 */
interface CraftPanelProps {
  /**
   * Candy and blood carried.
   */
  inventory: Inventory;

  /**
   * The level of the anvil in reach (null without one): late gear and
   * parts are only crafted beside one, for less the better it is.
   */
  anvil: number | null;

  /**
   * The bag, whose material stacks pay for crafting.
   */
  gear: Gear;

  /**
   * The world's skill tree; recipes it hasn't unlocked show locked.
   */
  tree: TreeState;

  /**
   * Crafts `count` of a recipe.
   */
  onCraft: (recipe: RecipeId, count: number) => void;

  /**
   * Lays the list out beside the selected recipe's details, which show
   * without holding (a TV controller is held, so there's room).
   */
  aside?: boolean;
}

/**
 * Everything that can be made, by category, as square icons: what's
 * unlocked shows (dimmed when the materials aren't there), and locked
 * things don't show at all unless Show locked is on (then as plain lock
 * tiles that don't give away what they are). Tap one to pick it: the bar along the bottom names it, with
 * a count to step up or down (up to what's affordable) and a Craft button.
 * Hold one to see its details. What's made goes into the bag; structures
 * are placed from there.
 *
 * @param {CraftPanelProps} props - Component props.
 * @returns {React.JSX.Element} The rendered list.
 */
function CraftPanel({
  inventory,
  gear,
  tree,
  anvil,
  onCraft,
  aside = false,
}: CraftPanelProps): React.JSX.Element {
  const { details, closeDetails, showLocked, setShowLocked, selected, select, setCount, hold, canMake, most, amount } = useCraftSelection(aside, tree, inventory, gear, anvil);

  const toggleLocked = (
    <ShowLockedToggle
      checked={showLocked}
      onChange={setShowLocked} />
  );

  const list = (
    <RecipeList
      tree={tree}
      showLocked={showLocked}
      selected={selected}
      canMake={canMake}
      bindHold={hold.bind}
      onTap={(recipe: RecipeId): void => {
        if (hold.tapped()) {
          select(recipe);
        }
      }} />
  );

  const bar = (
    <CraftBar
      selected={selected}
      aside={aside}
      amount={amount}
      most={most}
      onCount={setCount}
      onCraft={onCraft} />
  );

  if (aside) {
    return (
      <div className='flex min-h-0 w-full flex-1 gap-md'>
        <div className='scrollbar-none flex min-h-0 w-[min(400px,55%)] shrink-0 touch-pan-y flex-col gap-sm overflow-y-auto'>
          {toggleLocked}
          {list}
        </div>
        <div className='flex min-h-0 min-w-0 flex-1 flex-col gap-sm'>
          {selected ? (
            <ItemDetails
              inline
              item={selected}
              anvil={anvil}
              tree={tree}
              inventory={inventory}
              bag={gear.bag} />
          ) : <span className='flex-1' />}
          {bar}
        </div>
      </div>
    );
  }

  return (
    <div className='flex min-h-full w-full flex-col gap-sm'>
      {toggleLocked}
      {list}
      {bar}
      {details && (
        <ItemDetails
          item={details}
          anvil={anvil}
          tree={tree}
          inventory={inventory}
          bag={gear.bag}
          onClose={closeDetails} />
      )}
    </div>
  );
}

export default CraftPanel;
