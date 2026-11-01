// Packages
import React from 'react';
import { ArrowLeft, PackageOpen } from 'lucide-react';

// Local Imports
import PanicButton from '../hud/panic-button';
import StashSide from './stash-side';

// Types
import type { BagItem } from '@halloween/shared/inventory/bag-items';

/**
 * Props for the StashPanel component.
 */
interface StashPanelProps {
  /**
   * The player's bag slots.
   */
  bag: readonly (BagItem | null)[];

  /**
   * The open storage chest's slots.
   */
  stash: readonly (BagItem | null)[];

  /**
   * Moves the item in a slot across to the other side.
   */
  onMove: (from: 'bag' | 'stash', index: number) => void;

  /**
   * Closes the chest.
   */
  onClose: () => void;

  /**
   * Whether the player built it (only its keeper can pick it up).
   */
  yours: boolean;

  /**
   * Picks the (empty) chest up as a crate.
   */
  onTakeDown: () => void;

  /**
   * Makes the player run from monsters close by.
   */
  onPanic?: () => void;
}

/**
 * A storage chest, open full screen: the player's bag on the left and the
 * chest on the right; tapping an item moves it to the other side (stacking
 * where it can). Anyone can open it; only its builder sees Pick up, which
 * takes the chest back as a crate once it's empty. It closes on Back, or when the player
 * walks away from it.
 *
 * @param {StashPanelProps} props - Component props.
 * @returns {React.JSX.Element} The rendered page.
 */
function StashPanel({
  bag,
  stash,
  onMove,
  onClose,
  yours,
  onTakeDown,
  onPanic,
}: StashPanelProps): React.JSX.Element {
  const empty = stash.every((item: BagItem | null): boolean => item === null);
  return (
    <div className='fixed inset-0 z-10 flex flex-col bg-background'>
      <header className='flex items-center gap-sm border-b border-border px-md py-xsm'>
        <button
          type='button'
          className='flex items-center gap-1.5 rounded-md border border-border bg-muted px-sm py-1.5 font-medium text-[13px] text-foreground'
          onClick={onClose}>
          <ArrowLeft size={14} />
          Back
        </button>
        <span className='flex-1 font-medium text-sm text-foreground'>Storage chest</span>
        {yours && (
        <button
          type='button'
          disabled={!empty}
          className='flex items-center gap-1.5 rounded-md border border-border bg-muted px-sm py-1.5 font-medium text-[13px] text-foreground disabled:opacity-40'
          onClick={onTakeDown}>
          <PackageOpen size={14} />
          Pick up
        </button>
        )}
        {onPanic && <PanicButton onPanic={onPanic} />}
      </header>
      <div className='flex min-h-0 flex-1 gap-lg overflow-y-auto p-md'>
        <StashSide
          title='Bag: tap to store'
          items={bag}
          onTap={(i: number): void => onMove('bag', i)} />
        <StashSide
          title='Chest: tap to take'
          items={stash}
          onTap={(i: number): void => onMove('stash', i)} />
      </div>
    </div>
  );
}

export default StashPanel;
