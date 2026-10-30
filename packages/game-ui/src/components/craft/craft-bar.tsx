// Packages
import React from 'react';
import { Minus, Plus } from 'lucide-react';

// Local Imports
import { recipeName } from '../../helpers/recipes';

// Types
import type { RecipeId } from '@halloween/shared/crafting/recipes';

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
 * name, a count to step up or down, and Craft; a hint before anything is
 * picked.
 *
 * @param {CraftBarProps} props - Component props.
 * @returns {React.JSX.Element} The rendered bar.
 */
function CraftBar({
  selected,
  aside,
  amount,
  most,
  onCount,
  onCraft,
}: CraftBarProps): React.JSX.Element {
  return (
    <div className='sticky bottom-0 mt-auto flex items-center gap-sm border-t border-border bg-background pt-sm'>
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
        <span className='font-medium text-xs leading-tight text-foreground-muted'>{aside ? 'Tap something to see it, then craft it here.' : 'Tap something to craft it. Hold for details.'}</span>
      )}
    </div>
  );
}

export default CraftBar;
