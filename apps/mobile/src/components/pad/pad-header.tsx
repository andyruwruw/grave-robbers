// Packages
import React from 'react';
import { ArrowRightLeft, Gamepad2, LogOut } from 'lucide-react';
import Button from '@halloween/ui/components/ui/controls/button';
import Hearts from '@halloween/game-ui/components/hud/hearts';
import InventoryBar from '@halloween/game-ui/components/hud/inventory-bar';

// Local Imports
import { PHONE_DISPLAY } from '../../config/display';

// Types
import type { Inventory } from '@halloween/shared/goods/goods';
import type { PadInfo } from '@halloween/shared/protocol/pads';
import type { Vitals } from '@halloween/shared/protocol/state/vitals';

/**
 * Props for PadHeader.
 */
interface PadHeaderProps {
  /**
   * Health, spawn protection, and death.
   */
  vitals: Vitals;

  /**
   * What the player carries.
   */
  inventory: Inventory;

  /**
   * Game controllers plugged into the TV.
   */
  pads: PadInfo[];

  /**
   * The one this player holds, if any.
   */
  myPad: PadInfo | null;

  /**
   * Whether the TV controllers popover is open.
   */
  padMenu: boolean;

  /**
   * Opens or closes the TV controllers popover.
   */
  onPadMenu: (open: boolean) => void;

  /**
   * Whether the move-to-another-device popover is open.
   */
  transferMenu: boolean;

  /**
   * Opens or closes the move-to-another-device popover.
   */
  onTransferMenu: (open: boolean) => void;

  /**
   * Removes the player from the game.
   */
  onLeave: () => void;
}

/**
 * The pad's top bar: hearts, candy and blood, the TV controllers button
 * (while the TV has any), move to another device, and leave.
 *
 * @param {PadHeaderProps} props - Component props.
 * @returns {React.JSX.Element} The rendered bar.
 */
function PadHeader({ vitals, inventory, pads, myPad, padMenu, onPadMenu, transferMenu, onTransferMenu, onLeave }: PadHeaderProps): React.JSX.Element {
  return (
    <header className='flex items-center gap-md border-b border-border px-md py-sm'>
      <Hearts
        hp={vitals.hp}
        wounded={vitals.wounded}
        healing={vitals.healing}
        overheal={vitals.overheal} />
      <span className='flex-1' />
      {PHONE_DISPLAY.showResources && <InventoryBar inventory={inventory} />}
      {pads.length > 0 && (
        <Button
          variant='ghost'
          size='icon'
          aria-label='TV controllers'
          aria-pressed={padMenu}
          onClick={(): void => onPadMenu(!padMenu)}>
          <Gamepad2
            size={14}
            className={myPad ? 'text-brand' : undefined} />
        </Button>
      )}
      <Button
        variant='ghost'
        size='icon'
        aria-label='Move to another device'
        aria-pressed={transferMenu}
        onClick={(): void => onTransferMenu(!transferMenu)}>
        <ArrowRightLeft size={14} />
      </Button>
      <Button
        variant='ghost'
        size='icon'
        aria-label='Leave game'
        onClick={onLeave}>
        <LogOut size={14} />
      </Button>
    </header>
  );
}

export default PadHeader;
