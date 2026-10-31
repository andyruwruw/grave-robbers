// Packages
import React from 'react';

// Local Imports
import Trait from './trait';

// Types
import type { TraitLine } from '../../types/traits';

/**
 * Props for the TraitList component.
 */
interface TraitListProps {
  /**
   * The traits, in order.
   */
  traits: TraitLine[];
}

/**
 * An item's traits under a "Traits" heading, one sentence each; nothing at
 * all when it has none.
 *
 * @param {TraitListProps} props - Component props.
 * @returns {React.JSX.Element | null} The rendered list.
 */
function TraitList({ traits }: TraitListProps): React.JSX.Element | null {
  if (!traits.length) {
    return null;
  }
  return (
    <div className='flex flex-col gap-1.5 border-t border-border pt-2'>
      <span className='font-medium text-xs uppercase tracking-wide text-foreground-muted'>Traits</span>
      {traits.map(({ icon, text, item }, i: number) => (
        <Trait
          key={i}
          icon={icon}
          item={item}>
          {text}
        </Trait>
      ))}
    </div>
  );
}

export default TraitList;
