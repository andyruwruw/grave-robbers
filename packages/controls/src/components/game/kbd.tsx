// Packages
import React from 'react';

/**
 * Props for the Kbd component.
 */
interface KbdProps {
  /**
   * The key's letter.
   */
  children: string;
}

/**
 * A keyboard shortcut's letter, shown beside what it does on the TV.
 *
 * @param {KbdProps} props - Component props.
 * @returns {React.JSX.Element} The rendered key.
 */
function Kbd({ children }: KbdProps): React.JSX.Element {
  return <kbd className='flex h-5 min-w-5 items-center justify-center rounded-sm border border-border px-1 font-mono text-[10px] leading-none text-foreground-muted'>{children}</kbd>;
}

export default Kbd;
