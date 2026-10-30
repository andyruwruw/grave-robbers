// Packages
import React from 'react';
import StashPanel from '@halloween/game-ui/components/stash/stash-panel';

// Types
import type { BagItem } from '@halloween/shared/inventory/bag-items';
import type { PlayerCommands } from '@halloween/game-ui/session/player-commands';

/**
 * Props for StashLayer.
 */
interface StashLayerProps {
  /**
   * Set to the layer while no menu is open, for the selection.
   */
  menuRef: React.RefObject<HTMLDivElement | null> | undefined;

  /**
   * The player's bag slots.
   */
  bag: readonly (BagItem | null)[];

  /**
   * The open storage chest's slots.
   */
  stash: readonly (BagItem | null)[];

  /**
   * The player's commands.
   */
  commands: PlayerCommands;
}

/**
 * The open storage chest on /play.
 *
 * @param {StashLayerProps} props - Component props.
 * @returns {React.JSX.Element} The rendered layer.
 */
function StashLayer({ menuRef, bag, stash, commands }: StashLayerProps): React.JSX.Element {
  return (
    <div ref={menuRef}>
      <StashPanel
        bag={bag}
        stash={stash}
        onMove={commands.stashMove}
        onClose={commands.stashClose}
        onTakeDown={commands.stashTakeDown} />
    </div>
  );
}

export default StashLayer;
