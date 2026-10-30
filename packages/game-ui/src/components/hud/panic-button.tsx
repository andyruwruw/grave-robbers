// Packages
import React from 'react';
import { Siren } from 'lucide-react';

/**
 * Props for the PanicButton component.
 */
interface PanicButtonProps {
  /**
   * Makes the player run from monsters close by.
   */
  onPanic: () => void;
}

/**
 * The red Panic button on the phone's menus: the player runs from monsters
 * close by for a moment while the menu closes.
 *
 * @param {PanicButtonProps} props - Component props.
 * @returns {React.JSX.Element} The rendered button.
 */
function PanicButton({ onPanic }: PanicButtonProps): React.JSX.Element {
  return (
    <button
      type='button'
      className='flex items-center gap-1.5 rounded-md border-2 border-status-error-foreground bg-muted px-sm py-1.5 font-medium text-[13px] text-status-error-foreground active:opacity-60'
      onClick={onPanic}>
      <Siren size={14} />
      Panic
    </button>
  );
}

export default PanicButton;
