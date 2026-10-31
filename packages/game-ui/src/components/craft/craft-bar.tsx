// Packages
import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { craftCost, needsAnvil, recipeParts } from '@halloween/shared/crafting/recipes';

// Local Imports
import { recipeName } from '../../helpers/recipes';
import GoodsRow from '../items/goods-row';

// Types
import type { RecipeId } from '@halloween/shared/crafting/recipes';
import type { Goods } from '@halloween/shared/goods/goods';
import type { BagItem } from '@halloween/shared/inventory/bag-items';

/**
 * Props for the CraftBar component.
 */
interface CraftBarProps {
  /**
   * The recipe picked, or null.
   */
  selected: RecipeId | null;

  /**
   * Whether the details show beside the list, so the bar skips the name.
   */
  aside: boolean;

  /**
   * How many will be crafted.
   */
  amount: number;

  /**
   * How many can be made.
   */
  most: number;

  /**
   * The level of the anvil in reach (null without one).
   */
  anvil: number | null;

  /**
   * Whether crafting is free (no cost or anvil needed).
   */
  free: boolean;

  /**
   * How many of a good the player carries.
   */
  have: (g: Goods) => number;

  /**
   * The bag, for gear a recipe builds in.
   */
  bag: readonly (BagItem | null)[];

  /**
   * Sets how many to craft.
   */
  onCount: (count: number) => void;

  /**
   * Crafts `count` of a recipe.
   */
  onCraft: (recipe: RecipeId, count: number) => void;
}

/**
 * The sticky bar along the bottom of the craft page: the picked recipe's
 * cost for one (what's short in red) and whether it needs an anvil, unless
 * the details show beside it; then its name, a count to step up or down,
 * and Craft. A hint before anything is picked.
 *
 * @param {CraftBarProps} props - Component props.
 * @returns {React.JSX.Element} The rendered bar.
 */
function CraftBar({
  selected,
  aside,
  amount,
  most,
  anvil,
  free,
  have,
  bag,
  onCount,
  onCraft,
}: CraftBarProps): React.JSX.Element {
  return (
    <div className='sticky bottom-0 mt-auto flex flex-col gap-xsm border-t border-border bg-background py-sm'>
      {selected && !aside && !free && (
        <div className='flex flex-wrap items-center gap-x-sm gap-y-xsm'>
          <GoodsRow
            goods={craftCost(selected, anvil)}
            have={have}
            parts={recipeParts(selected)}
            bag={bag} />
          {needsAnvil(selected) && anvil === null && <span className='font-medium text-xs text-danger'>Craft beside an anvil</span>}
        </div>
      )}
      <div className='flex items-center gap-sm'>
        {selected ? (
          <>
            {aside ? <span className='flex-1' /> : (
              <span className='min-w-0 flex-1 truncate font-medium text-[13px] leading-tight text-foreground'>
                {recipeName(selected)}
              </span>
            )}
            <button
              type='button'
              aria-label='Fewer'
              disabled={amount <= 1}
              className='flex h-8 w-8 items-center justify-center rounded-[2px] border border-border bg-muted text-foreground disabled:opacity-40'
              onClick={(): void => onCount(Math.max(1, amount - 1))}>
              <Minus size={14} />
            </button>
            <span className='w-6 text-center font-medium text-sm text-foreground'>{most > 0 ? amount : 0}</span>
            <button
              type='button'
              aria-label='More'
              disabled={amount >= most}
              className='flex h-8 w-8 items-center justify-center rounded-[2px] border border-border bg-muted text-foreground disabled:opacity-40'
              onClick={(): void => onCount(Math.min(most, amount + 1))}>
              <Plus size={14} />
            </button>
            <button
              type='button'
              disabled={most < 1}
              className='h-8 rounded-[2px] border-2 border-brand bg-brand-muted px-sm font-medium text-[13px] text-foreground disabled:border-border disabled:bg-muted disabled:text-foreground-muted disabled:opacity-60'
              onClick={(): void => onCraft(selected, amount)}>
              Craft
            </button>
          </>
        ) : (
          <span className='font-medium text-xs leading-tight text-foreground-muted'>{aside ? 'Tap something to see it, then craft it here.' : 'Tap something to craft it. Double tap for details.'}</span>
        )}
      </div>
    </div>
  );
}

export default CraftBar;
