// Packages
import React, { useRef } from 'react';
import Hearts from '@halloween/game-ui/components/hud/hearts';
import InventoryBar from '@halloween/game-ui/components/hud/inventory-bar';
import { PING_WARN_MS } from '@halloween/controls/config/stats';

// Local Imports
import { HUD_HEART_PX, HUD_RESOURCE_PX } from '../../config/play';
import { usePixelHud } from '../../hooks/use-pixel-hud';

// Types
import type { WorldRenderer } from '@halloween/renderer/world/world-renderer';
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

  /**
   * Whether the candy and blood counts show (Show candies & blood).
   */
  showResources: boolean;

  /**
   * The world renderer, whose post effects the hearts and counts are
   * painted through (`usePixelHud`).
   */
  rendererRef: React.RefObject<WorldRenderer | null>;
}

/**
 * The bar across the top of /play: hearts, the ping (red when it's high),
 * and candy and blood. The hearts and counts are laid out here but kept
 * invisible and painted into the world's frame (`usePixelHud`), so they're
 * pixelated and graded like the world; the ping stays crisp on top.
 *
 * @param {PlayHudProps} props - Component props.
 * @returns {React.JSX.Element} The rendered bar.
 */
function PlayHud({ vitals, ping, inventory, showResources, rendererRef }: PlayHudProps): React.JSX.Element {
  const rootRef = useRef<HTMLElement>(null);
  usePixelHud(rendererRef, rootRef);
  return (
    <header
      ref={rootRef}
      className='absolute inset-x-0 top-0 flex items-center gap-md bg-gradient-to-b from-background/80 to-transparent px-md pb-lg pt-sm'>
      <div
        data-hud-paint
        className='invisible'>
        <Hearts
          hp={vitals.hp}
          wounded={vitals.wounded}
          healing={vitals.healing}
          overheal={vitals.overheal}
          size={HUD_HEART_PX} />
      </div>
      <span className='flex-1' />
      {ping !== null && (
        <span
          className={`font-medium text-xs ${ping > PING_WARN_MS ? 'text-danger' : 'text-foreground-subtle'}`}
          title='Ping'>
          {ping} ms
        </span>
      )}
      {showResources && (
        <div
          data-hud-paint
          className='invisible'>
          <InventoryBar
            inventory={inventory}
            iconSize={HUD_RESOURCE_PX}
            textClassName='text-2xl' />
        </div>
      )}
    </header>
  );
}

export default PlayHud;
