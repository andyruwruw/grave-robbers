// Packages
import React from 'react';
import { RotateCcw } from 'lucide-react';

// Local Imports
import { SETTINGS_BUTTON } from '../../config/play';

/**
 * Props for SectionHeader.
 */
interface SectionHeaderProps {
  /**
   * The section's title.
   */
  title: string;

  /**
   * Puts the section's settings back.
   */
  onReset: () => void;

  /**
   * The reset button's text (Defaults unless given).
   */
  resetLabel?: string;

  /**
   * Whether everything is already at its default (the button is disabled).
   */
  atDefault?: boolean;
}

/**
 * One section's title with a button that puts its settings back.
 *
 * @param {SectionHeaderProps} props - Component props.
 * @returns {React.JSX.Element} The rendered header.
 */
function SectionHeader({ title, onReset, resetLabel = 'Defaults', atDefault = false }: SectionHeaderProps): React.JSX.Element {
  return (
    <div className='flex items-center justify-between gap-sm'>
      <span className='font-medium text-[13px] text-foreground-muted'>{title}</span>
      <button
        type='button'
        disabled={atDefault}
        className={`${SETTINGS_BUTTON} border-border bg-muted text-foreground-muted disabled:opacity-40`}
        onClick={onReset}>
        <RotateCcw size={10} />
        {resetLabel}
      </button>
    </div>
  );
}

export default SectionHeader;
