// Packages
import React from 'react';
import { ArrowDownToLine } from 'lucide-react';

/**
 * Props for the BagHintBar component.
 */
interface BagHintBarProps {
  /**
   * Whether something is picked up.
   */
  picked: boolean;

  /**
   * Throws what's picked up onto the facing tile.
   */
  onDrop: () => void;
}

/**
 * The line under the bag: what a tap does now, and a Drop button while
 * something is picked up.
 *
 * @param {BagHintBarProps} props - Component props.
 * @returns {React.JSX.Element} The rendered bar.
 */
function BagHintBar({ picked, onDrop }: BagHintBarProps): React.JSX.Element {
  return (
    <div className='flex min-h-6 items-center gap-sm'>
      <span className='flex-1 font-medium text-[11px] leading-relaxed text-foreground-subtle'>
        {picked ? 'Tap a slot to move it there, tap it again to use it' : 'Tap an item to pick it up, hold one for details'}
      </span>
      {picked && (
        <button
          type='button'
          aria-label='Drop it'
          className='flex shrink-0 items-center gap-1 rounded-[2px] border border-dashed border-status-warning-foreground bg-background px-sm py-1 font-medium text-xs text-status-warning-foreground'
          onClick={onDrop}>
          <ArrowDownToLine size={12} />
          DROP
        </button>
      )}
    </div>
  );
}

export default BagHintBar;
