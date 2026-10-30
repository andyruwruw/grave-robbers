// Packages
import React from 'react';

/**
 * Props for the Trait component.
 */
interface TraitProps {
  /**
   * An icon and the words.
   */
  children: React.ReactNode;
}

/**
 * A small labeled tag for a special trait.
 *
 * @param {TraitProps} props - Component props.
 * @returns {React.JSX.Element} The rendered tag.
 */
function Trait({ children }: TraitProps): React.JSX.Element {
  return <span className='flex items-center gap-1.5 font-medium text-xs leading-tight text-foreground'>{children}</span>;
}

export default Trait;
