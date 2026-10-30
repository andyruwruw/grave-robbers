// Packages
import React from 'react';

// Local Imports
import ItemIcon from '../items/item-icon';

// Types
import type { HoldProps } from '@halloween/ui/hooks/use-hold';
import type { IconKey } from '@halloween/renderer/types/icons';
import type { SlotTone } from '../../types/bag';

/**
 * Props for one slot.
 */
interface BagSlotProps {
  /**
   * The item's icon, or the empty slot's fallback.
   */
  icon: IconKey | null;

  /**
   * Whether something is in it.
   */
  filled: boolean;

  /**
   * What's in it, for screen readers and the tooltip.
   */
  label: string;

  /**
   * How many are stacked, or null for gear and empty slots.
   */
  count: number | null;

  /**
   * How much use a piece of gear has left (0 to 1), or null.
   */
  wear: number | null;

  /**
   * How it's drawn.
   */
  tone: SlotTone;

  /**
   * The long-press handlers for its details.
   */
  hold: HoldProps;

  /**
   * Called on a tap.
   */
  onTap: () => void;

  /**
   * Extra inline styles, such as a fixed width.
   */
  style?: React.CSSProperties;
}

/**
 * One square slot: the item's icon, with a bar for how much use a piece of
 * gear has left or a count for a stack.
 *
 * @param {BagSlotProps} props - Component props.
 * @returns {React.JSX.Element} The rendered slot.
 */
function BagSlot({
  icon,
  filled,
  label,
  count,
  wear,
  tone,
  hold,
  onTap,
  style,
}: BagSlotProps): React.JSX.Element {
  const border = tone === 'picked' ? 'border-brand bg-brand-muted ring-1 ring-brand' : tone === 'equipped' ? 'border-brand bg-surface' : tone === 'target' ? 'border-dashed border-brand bg-surface' : filled ? 'border-border bg-surface' : 'border-border bg-background';
  return (
    <button
      type='button'
      aria-label={label}
      title={filled ? label : undefined}
      className={`relative flex aspect-square shrink-0 items-center justify-center rounded-[2px] border ${border}`}
      style={style}
      {...hold}
      onClick={onTap}>
      {icon && (
        <ItemIcon
          item={icon}
          size={36}
          className={filled || tone === 'target' ? '' : 'opacity-30'} />
      )}
      {count !== null && <span className='absolute bottom-0 right-0.5 font-medium text-xs text-foreground'>{count}</span>}
      {wear !== null && (
        <span className='absolute inset-x-1 bottom-0.5 h-0.5 bg-background'>
          <span
            className='block h-full bg-foreground-muted'
            style={{ width: `${Math.min(100, wear * 100)}%` }} />
        </span>
      )}
    </button>
  );
}

export default BagSlot;
