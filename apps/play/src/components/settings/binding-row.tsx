// Packages
import React from 'react';

// Local Imports
import { SETTINGS_BUTTON } from '../../config/play';

/**
 * Props for BindingRow.
 */
interface BindingRowProps {
  /**
   * The action's name.
   */
  label: string;

  /**
   * The bound key or button, drawn.
   */
  value: React.ReactNode;

  /**
   * Whether it's waiting for a new key or button.
   */
  waiting: boolean;

  /**
   * Starts waiting for a new key or button.
   */
  onPress: () => void;
}

/**
 * One action and the key or button that does it; pressing it waits for a
 * new one.
 *
 * @param {BindingRowProps} props - Component props.
 * @returns {React.JSX.Element} The rendered row.
 */
function BindingRow({ label, value, waiting, onPress }: BindingRowProps): React.JSX.Element {
  return (
    <div className='flex items-center gap-sm'>
      <span className='min-w-0 flex-1 truncate font-medium text-xs text-foreground'>{label}</span>
      <button
        type='button'
        aria-pressed={waiting}
        className={`${SETTINGS_BUTTON} flex w-28 items-center justify-center ${waiting ? 'border-brand bg-brand-muted text-foreground' : 'border-border bg-muted text-foreground'}`}
        onClick={onPress}>
        {waiting ? 'Press...' : value}
      </button>
    </div>
  );
}

export default BindingRow;
