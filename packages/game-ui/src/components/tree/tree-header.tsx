// Packages
import React from 'react';
import { ArrowLeft, FlaskConical } from 'lucide-react';

// Local Imports
import PanicButton from '../hud/panic-button';

/**
 * Props for the TreeHeader component.
 */
interface TreeHeaderProps {
  /**
   * Drawn inside the phone's layout, where the header is hidden.
   */
  embedded: boolean;

  /**
   * What a research table in reach takes off upgrades (0 without one).
   */
  research: number;

  /**
   * Closes the tree.
   */
  onBack: () => void;

  /**
   * Makes the player run from monsters close by.
   */
  onPanic: () => void;
}

/**
 * The tree page's header: Back, the research table note, and Panic.
 *
 * @param {TreeHeaderProps} props - Component props.
 * @returns {React.JSX.Element} The rendered header.
 */
function TreeHeader({
  embedded,
  research,
  onBack,
  onPanic,
}: TreeHeaderProps): React.JSX.Element {
  return (
    <header className={`flex items-center gap-sm border-b border-border px-md py-xsm ${embedded ? 'hidden' : ''}`}>
      {!embedded && (
        <button
          type='button'
          className='flex items-center gap-1.5 rounded-md border border-border bg-muted px-sm py-1.5 font-medium text-[13px] text-foreground'
          onClick={onBack}>
          <ArrowLeft size={14} />
          Back
        </button>
      )}
      <span className={`flex flex-1 items-center gap-1.5 font-medium text-xs leading-tight ${research > 0 ? 'text-status-success-foreground' : 'text-foreground-muted'}`}>
        <FlaskConical size={12} />
        {research > 0 ? `Research table: upgrades ${Math.round(research * 100)}% off` : 'Upgrades cost less by a research table'}
      </span>
      <PanicButton onPanic={onPanic} />
    </header>
  );
}

export default TreeHeader;
