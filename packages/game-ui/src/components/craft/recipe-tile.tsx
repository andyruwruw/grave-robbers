// Packages
import React from 'react';
import { Lock } from 'lucide-react';

// Local Imports
import { recipeName } from '../../helpers/recipes';
import ItemIcon from '../items/item-icon';

// Types
import type { RecipeId } from '@halloween/shared/crafting/recipes';
import type { HoldProps } from '@halloween/ui/hooks/use-hold';

/**
 * Props for the RecipeTile component.
 */
interface RecipeTileProps {
  /**
   * The recipe.
   */
  recipe: RecipeId;

  /**
   * Whether the skill tree has unlocked it.
   */
  open: boolean;

  /**
   * Whether any can be made now.
   */
  affordable: boolean;

  /**
   * Whether it's the one picked for the craft bar.
   */
  selected: boolean;

  /**
   * The long-press handlers for its details.
   */
  hold: HoldProps;

  /**
   * Called on a click.
   */
  onClick: () => void;
}

/**
 * One square in the craft list: a plain lock tile for something locked, or
 * the recipe's icon (dimmed when it can't be made).
 *
 * @param {RecipeTileProps} props - Component props.
 * @returns {React.JSX.Element} The rendered tile.
 */
function RecipeTile({
  recipe,
  open,
  affordable,
  selected,
  hold,
  onClick,
}: RecipeTileProps): React.JSX.Element {
  if (!open) {
    return (
      <span
        aria-label='Locked'
        title='Locked'
        className='flex aspect-square items-center justify-center rounded-[2px] border border-border bg-background text-foreground-subtle'>
        <Lock size={12} />
      </span>
    );
  }
  return (
    <button
      type='button'
      aria-label={recipeName(recipe)}
      title={recipeName(recipe)}
      aria-pressed={selected}
      className={`relative flex aspect-square items-center justify-center rounded-[2px] border ${selected ? 'border-brand bg-brand-muted ring-1 ring-brand' : 'border-border bg-surface'} ${affordable || selected ? '' : 'opacity-40'}`}
      {...hold}
      onClick={onClick}>
      <ItemIcon
        item={recipe}
        size={36} />
    </button>
  );
}

export default RecipeTile;
