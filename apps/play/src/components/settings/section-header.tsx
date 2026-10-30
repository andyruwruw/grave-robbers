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
   * Puts the section's bindings back.
   */
  onReset: () => void;
}

/**
 * One section's title with a button that puts its bindings back.
 *
 * @param {SectionHeaderProps} props - Component props.
 * @returns {React.JSX.Element} The rendered header.
 */
function SectionHeader({ title, onReset }: SectionHeaderProps): React.JSX.Element {
  return (
    <div className='flex items-center justify-between gap-sm'>
      <span className='font-medium text-[13px] text-foreground-muted'>{title}</span>
      <button
        type='button'
        className={`${SETTINGS_BUTTON} border-border bg-muted text-foreground-muted`}
        onClick={onReset}>
        <RotateCcw size={10} />
        Defaults
      </button>
    </div>
  );
}

export default SectionHeader;
