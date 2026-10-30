// Packages
import React from 'react';
import { Check } from 'lucide-react';

/**
 * Props for the ShowLockedToggle component.
 */
interface ShowLockedToggleProps {
  /**
   * Whether locked recipes show.
   */
  checked: boolean;

  /**
   * Called with the new setting.
   */
  onChange: (checked: boolean) => void;
}

/**
 * The Show locked checkbox above the craft list.
 *
 * @param {ShowLockedToggleProps} props - Component props.
 * @returns {React.JSX.Element} The rendered checkbox.
 */
function ShowLockedToggle({ checked, onChange }: ShowLockedToggleProps): React.JSX.Element {
  return (
    <label className='flex cursor-pointer items-center gap-1.5 self-start font-medium text-xs text-foreground-muted'>
      <input
        type='checkbox'
        className='peer sr-only'
        checked={checked}
        onChange={(e: React.ChangeEvent<HTMLInputElement>): void => onChange(e.target.checked)} />
      <span className={`flex h-3.5 w-3.5 items-center justify-center rounded-sm border ${checked ? 'border-brand bg-brand text-background' : 'border-border bg-muted'}`}>
        {checked && <Check size={10} />}
      </span>
      Show locked
    </label>
  );
}

export default ShowLockedToggle;
