// Packages
import React from 'react';
import { Gamepad2, LogOut } from 'lucide-react';
import Button from '@halloween/ui/components/ui/controls/button';
import Hearts from '@halloween/game-ui/components/hud/hearts';
import InventoryBar from '@halloween/game-ui/components/hud/inventory-bar';

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
   * Removes the player from the game.
   */
  onLeave: () => void;
}

/**
 * The pad's top bar: hearts, candy and blood, the TV controllers button
 * (while the TV has any), and leave.
 *
 * @param {PadHeaderProps} props - Component props.
 * @returns {React.JSX.Element} The rendered bar.
 */
function PadHeader({ vitals, inventory, pads, myPad, padMenu, onPadMenu, onLeave }: PadHeaderProps): React.JSX.Element {
  return (
    <header className='flex items-center gap-md border-b border-border px-md py-sm'>
      <Hearts
        hp={vitals.hp}
        wounded={vitals.wounded}
        healing={vitals.healing} />
      <span className='flex-1' />
      <InventoryBar inventory={inventory} />
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
        aria-label='Leave game'
        onClick={onLeave}>
        <LogOut size={14} />
      </Button>
    </header>
  );
}

export default PadHeader;
