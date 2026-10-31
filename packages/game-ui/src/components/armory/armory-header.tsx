// Packages
import React from 'react';
import { ArrowLeft } from 'lucide-react';

// Local Imports
import PanicButton from '../hud/panic-button';

/**
 * Props for the ArmoryHeader component.
 */
interface ArmoryHeaderProps {
  /**
   * Closes the Armory.
   */
  onBack: () => void;

  /**
   * Makes the player run from monsters close by.
   */
  onPanic: () => void;
}

/**
 * The full-screen Armory's header: Back, its title, and Panic.
 *
 * @param {ArmoryHeaderProps} props - Component props.
 * @returns {React.JSX.Element} The rendered header.
 */
function ArmoryHeader({ onBack, onPanic }: ArmoryHeaderProps): React.JSX.Element {
  return (
    <header className='flex shrink-0 items-center gap-sm border-b border-border px-md py-xsm'>
      <button
        type='button'
        className='flex items-center gap-1.5 rounded-md border border-border bg-muted px-sm py-1.5 font-medium text-[13px] text-foreground'
        onClick={onBack}>
        <ArrowLeft size={14} />
        Back
      </button>
      <span className='flex-1 font-medium text-sm text-foreground'>Armory</span>
      <PanicButton onPanic={onPanic} />
    </header>
  );
}

export default ArmoryHeader;
