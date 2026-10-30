// Packages
import React from 'react';
import { ArrowLeft, Gamepad2 } from 'lucide-react';

// Types
import type { PadInfo } from '@halloween/shared/protocol/pads';

/**
 * Props for TvPadMenu.
 */
interface TvPadMenuProps {
  /**
   * Game controllers plugged into the TV, and whether this player or
   * someone else has each.
   */
  pads: PadInfo[];

  /**
   * The one this player holds, if any.
   */
  myPad: PadInfo | null;

  /**
   * Closes the popover.
   */
  onClose: () => void;

  /**
   * Takes a TV controller to play with.
   */
  onClaimPad: (id: string) => void;

  /**
   * Hands the TV controller back.
   */
  onReleasePad: () => void;
}

/**
 * The TV controllers popover: the controllers to claim, or, while one is
 * held, what its buttons do and Release. Clicking outside closes it.
 *
 * @param {TvPadMenuProps} props - Component props.
 * @returns {React.JSX.Element} The rendered popover.
 */
function TvPadMenu({ pads, myPad, onClose, onClaimPad, onReleasePad }: TvPadMenuProps): React.JSX.Element {
  return (
    <>
      <div
        className='fixed inset-0 z-20'
        onClick={onClose} />
      <div className='absolute right-md top-12 z-30 flex w-64 flex-col gap-1 rounded-md border border-border bg-background p-sm shadow-lg'>
        {myPad ? (
          <>
            <span className='flex items-center gap-sm px-xsm py-1.5'>
              <Gamepad2
                size={14}
                className='shrink-0 text-brand' />
              <span className='min-w-0 flex-1 truncate text-xs text-foreground'>{myPad.name}</span>
            </span>
            <span className='px-xsm pb-xsm font-medium text-xs leading-relaxed text-foreground-muted'>Left stick walks, right stick aims, RT hits, LB blocks, B panics; the left face button opens the bag, the top one crafting, and minus or back the tree. Building: RT places, LB and RB turn</span>
            <button
              type='button'
              className='flex items-center justify-center gap-1.5 rounded-md border border-border bg-muted px-sm py-1.5 font-medium text-[13px] text-foreground'
              onClick={(): void => {
                onReleasePad();
                onClose();
              }}>
              <ArrowLeft size={12} />
              Release
            </button>
          </>
        ) : (
          <>
            <span className='px-xsm pb-xsm font-medium text-xs text-foreground-muted'>Controllers on the TV</span>
            {pads.map((pad: PadInfo) => (
              <button
                key={pad.id}
                type='button'
                disabled={pad.taken}
                className='flex items-center gap-sm rounded-sm px-xsm py-1.5 text-left hover:bg-muted disabled:opacity-40'
                onClick={(): void => {
                  onClaimPad(pad.id);
                  onClose();
                }}>
                <Gamepad2
                  size={14}
                  className='shrink-0 text-foreground-muted' />
                <span className='min-w-0 flex-1 truncate text-xs text-foreground'>{pad.name}</span>
                <span className='font-medium text-xs text-foreground-muted'>{pad.taken ? 'TAKEN' : 'USE'}</span>
              </button>
            ))}
          </>
        )}
      </div>
    </>
  );
}

export default TvPadMenu;
