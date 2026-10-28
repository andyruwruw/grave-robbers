// Packages
import React, { useState } from 'react';
import { Check, Lock, Minus, Plus } from 'lucide-react';
import {
  RECIPES,
  affordableCount,
  ammoMade,
  itemLabel,
  recipeCost,
} from '@halloween/shared/gear';
import { BRANCHES, TREE_NODE, recipeUnlocked } from '@halloween/shared/tree';

// Local Imports
import { useHold } from '../../../hooks/use-hold';
import ItemDetails from './item-details';
import ItemIcon from './item-icon';

// Types
import type { Gear, RecipeId } from '@halloween/shared/gear';
import type { Inventory } from '@halloween/shared/items';
import type { Branch, TreeState } from '@halloween/shared/tree';

/**
 * Props for the CraftPanel component.
 */
interface CraftPanelProps {
  /**
   * Candy and blood carried.
   */
  inventory: Inventory;

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
}

/**
 * Most a single Craft press makes (the server's cap too).
 */
const MAX_CRAFT = 99;

/**
 * Each recipe's category: its skill tree branch (ammo goes with weapons).
 */
function branchOf(recipe: RecipeId): Branch {
  return recipe === 'bolts' || recipe === 'arrows' ? 'weapons' : TREE_NODE[recipe].branch;
}

/**
 * What a recipe is called: ammo by the bundle one craft makes.
 */
function recipeName(recipe: RecipeId): string {
  return recipe === 'bolts' || recipe === 'arrows' ? `${ammoMade(recipe)} ${recipe}` : itemLabel(recipe);
}

/**
 * Everything that can be made, by category, as square icons: what's
 * unlocked shows (dimmed when the materials aren't there), and locked
 * things are just lock tiles unless Show locked is on (then dimmed icons
 * with a lock). Tap one to pick it: the bar along the bottom names it, with
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
  onCraft,
}: CraftPanelProps): React.JSX.Element {
  const [details, setDetails] = useState<RecipeId | null>(null);
  const [showLocked, setShowLocked] = useState(false);
  const [selected, setSelected] = useState<RecipeId | null>(null);
  const [count, setCount] = useState(1);
  const hold = useHold<RecipeId>(setDetails);
  const canMake = (recipe: RecipeId): number => (!recipeUnlocked(recipe, tree) ? 0 : tree.free ? MAX_CRAFT : affordableCount(recipeCost(recipe), inventory, gear.bag, MAX_CRAFT));
  const most = selected ? canMake(selected) : 0;
  const amount = Math.max(1, Math.min(count, most));

  return (
    <div className='flex min-h-full w-full flex-col gap-sm'>
      <label className='flex cursor-pointer items-center gap-xsm self-start font-pixel text-[7px] text-foreground-muted'>
        <input
          type='checkbox'
          className='peer sr-only'
          checked={showLocked}
          onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setShowLocked(e.target.checked)} />
        <span className={`flex h-3.5 w-3.5 items-center justify-center rounded-sm border ${showLocked ? 'border-brand bg-brand text-background' : 'border-border bg-muted'}`}>
          {showLocked && <Check size={10} />}
        </span>
        Show locked
      </label>
      {BRANCHES.map(({ id, label }: { id: Branch; label: string }) => {
        const recipes = RECIPES.filter((r: RecipeId): boolean => branchOf(r) === id);
        if (recipes.length === 0) {
          return null;
        }
        return (
          <div
            key={id}
            className='flex flex-col gap-1'>
            <span className='font-pixel text-[7px] text-foreground-muted'>{label}</span>
            <div className='grid w-full grid-cols-6 gap-1'>
              {recipes.map((recipe: RecipeId) => {
                const open = recipeUnlocked(recipe, tree);
                const affordable = canMake(recipe) > 0;
                if (!open && !showLocked) {
                  return (
                    <span
                      key={recipe}
                      aria-label='Locked'
                      className='flex aspect-square items-center justify-center rounded-[2px] border border-border bg-background text-foreground-subtle'>
                      <Lock size={12} />
                    </span>
                  );
                }
                return (
                  <button
                    key={recipe}
                    type='button'
                    aria-label={recipeName(recipe)}
                    aria-pressed={selected === recipe}
                    className={`relative flex aspect-square items-center justify-center rounded-[2px] border ${selected === recipe ? 'border-brand bg-brand-muted ring-1 ring-brand' : 'border-border bg-surface'} ${affordable || selected === recipe ? '' : 'opacity-40'}`}
                    {...hold.bind(recipe)}
                    onClick={(): void => {
                      if (hold.tapped()) {
                        setSelected(recipe);
                        setCount(1);
                      }
                    }}>
                    <ItemIcon
                      item={recipe}
                      size={36} />
                    {!open && (
                      <Lock
                        size={10}
                        className='absolute right-0.5 top-0.5 text-foreground-muted' />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      <div className='sticky bottom-0 mt-auto flex items-center gap-sm border-t border-border bg-background pt-sm'>
        {selected ? (
          <>
            <span className='min-w-0 flex-1 truncate font-pixel text-[8px] leading-tight text-foreground'>
              {recipeName(selected)}
            </span>
            <button
              type='button'
              aria-label='Fewer'
              disabled={amount <= 1}
              className='flex h-8 w-8 items-center justify-center rounded-[2px] border border-border bg-muted text-foreground disabled:opacity-40'
              onClick={(): void => setCount(Math.max(1, amount - 1))}>
              <Minus size={14} />
            </button>
            <span className='w-6 text-center font-pixel text-[9px] text-foreground'>{most > 0 ? amount : 0}</span>
            <button
              type='button'
              aria-label='More'
              disabled={amount >= most}
              className='flex h-8 w-8 items-center justify-center rounded-[2px] border border-border bg-muted text-foreground disabled:opacity-40'
              onClick={(): void => setCount(Math.min(most, amount + 1))}>
              <Plus size={14} />
            </button>
            <button
              type='button'
              disabled={most < 1}
              className='h-8 rounded-[2px] border-2 border-brand bg-brand-muted px-sm font-pixel text-[8px] text-foreground disabled:border-border disabled:bg-muted disabled:text-foreground-muted disabled:opacity-60'
              onClick={(): void => onCraft(selected, amount)}>
              Craft
            </button>
          </>
        ) : (
          <span className='font-pixel text-[7px] leading-tight text-foreground-muted'>Tap something to craft it. Hold for details.</span>
        )}
      </div>
      {details && (
        <ItemDetails
          item={details}
          tree={tree}
          inventory={inventory}
          bag={gear.bag}
          onClose={(): void => setDetails(null)} />
      )}
    </div>
  );
}

export default CraftPanel;
