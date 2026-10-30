// Packages
import React, { useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';

// Local Imports
import { PANEL_BUTTON } from '../../config/styles';

/**
 * Props for the ResetWorldButton component.
 */
interface ResetWorldButtonProps {
  /**
   * Called when the button is pressed with the box ticked.
   */
  onReset: () => void;
}

/**
 * Starts a new world: a "replace this world" box that has to be ticked
 * first, and the button, which does nothing until it is. The box clears
 * again after each new world.
 *
 * @param {ResetWorldButtonProps} props - Component props.
 * @returns {React.JSX.Element} The rendered control.
 */
function ResetWorldButton({ onReset }: ResetWorldButtonProps): React.JSX.Element {
  const [sure, setSure] = useState(false);

  return (
    <div className='flex flex-col gap-sm'>
      <label className='flex cursor-pointer items-center gap-sm px-xsm'>
        <input
          type='checkbox'
          className='peer sr-only'
          checked={sure}
          onChange={(e: React.ChangeEvent<HTMLInputElement>): void => setSure(e.target.checked)} />
        <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border peer-focus-visible:ring-1 peer-focus-visible:ring-brand ${sure ? 'border-danger bg-danger text-background' : 'border-border bg-muted'}`}>
          {sure && <Check size={12} />}
        </span>
        <span className='text-xs text-foreground'>Replace this world (everything built and carried is lost)</span>
      </label>
      <button
        type='button'
        disabled={!sure}
        className={`${PANEL_BUTTON} disabled:cursor-not-allowed ${sure ? 'border-danger text-danger' : ''}`}
        onClick={(): void => {
          if (sure) {
            setSure(false);
            onReset();
          }
        }}>
        <RotateCcw size={14} />
        New world
      </button>
    </div>
  );
}

export default ResetWorldButton;
