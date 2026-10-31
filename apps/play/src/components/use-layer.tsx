// Packages
import React from 'react';
import UsePanel from '@halloween/game-ui/components/use/use-panel';

// Types
import type { Inventory } from '@halloween/shared/goods/goods';
import type { BagItem } from '@halloween/shared/inventory/bag-items';
import type { UsePanel as UsePanelState } from '@halloween/shared/protocol/state/use-panel';
import type { TreeState } from '@halloween/shared/skill-tree/types/skill-tree';
import type { PlayerCommands } from '@halloween/game-ui/session/player-commands';

/**
 * Props for UseLayer.
 */
interface UseLayerProps {
  /**
   * Set to the layer while no menu is open, for the selection.
   */
  menuRef: React.RefObject<HTMLDivElement | null> | undefined;

  /**
   * What USE opened.
   */
  panel: UsePanelState;

  /**
   * The player's bag slots.
   */
  bag: readonly (BagItem | null)[];

  /**
   * Candy and blood carried.
   */
  inventory: Inventory;

  /**
   * The player's skill tree.
   */
  tree: TreeState;

  /**
   * The player's commands.
   */
  commands: PlayerCommands;
}

/**
 * The bone digger, station, or belt sorter opened with USE on /play.
 *
 * @param {UseLayerProps} props - Component props.
 * @returns {React.JSX.Element} The rendered layer.
 */
function UseLayer({ menuRef, panel, bag, inventory, tree, commands }: UseLayerProps): React.JSX.Element {
  return (
    <div ref={menuRef}>
      <UsePanel
        panel={panel}
        bag={bag}
        inventory={inventory}
        tree={tree}
        onFeed={commands.useFeed}
        onCollect={commands.useCollect}
        onRoute={commands.useRoute}
        onClose={commands.useClose} />
    </div>
  );
}

export default UseLayer;
