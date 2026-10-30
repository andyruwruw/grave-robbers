// Packages
import React from 'react';
import Hearts from '@halloween/game-ui/components/hud/hearts';
import InventoryBar from '@halloween/game-ui/components/hud/inventory-bar';
import { PING_WARN_MS } from '@halloween/controls/config/stats';

// Types
import type { Inventory } from '@halloween/shared/goods/goods';
import type { Vitals } from '@halloween/shared/protocol/state/vitals';

/**
 * Props for PlayHud.
 */
interface PlayHudProps {
  /**
   * Health, spawn protection, and death.
   */
  vitals: Vitals;

  /**
   * The viewer socket's round trip in ms, or null until the first one.
   */
  ping: number | null;

  /**
   * What the player carries.
   */
  inventory: Inventory;
}

/**
 * The bar across the top of /play: hearts, the ping (red when it's high),
 * and candy and blood.
 *
 * @param {PlayHudProps} props - Component props.
 * @returns {React.JSX.Element} The rendered bar.
 */
function PlayHud({ vitals, ping, inventory }: PlayHudProps): React.JSX.Element {
  return (
    <header className='absolute inset-x-0 top-0 flex items-center gap-md bg-gradient-to-b from-background/80 to-transparent px-md pb-lg pt-sm'>
      <Hearts
        hp={vitals.hp}
        wounded={vitals.wounded}
        healing={vitals.healing} />
      <span className='flex-1' />
      {ping !== null && (
        <span
          className={`font-medium text-xs ${ping > PING_WARN_MS ? 'text-danger' : 'text-foreground-subtle'}`}
          title='Ping'>
          {ping} ms
        </span>
      )}
      <InventoryBar inventory={inventory} />
    </header>
  );
}

export default PlayHud;
