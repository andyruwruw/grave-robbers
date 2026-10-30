// Packages
import React from 'react';
import BagPanel from '@halloween/game-ui/components/bag/bag-panel';
import CraftPanel from '@halloween/game-ui/components/craft/craft-panel';
import BuildError from '@halloween/game-ui/components/hud/build-error';
import PanicButton from '@halloween/game-ui/components/hud/panic-button';

// Local Imports
import { BAG_SLOT_SIZE } from '../../config/pad';

// Types
import type { Gear } from '@halloween/shared/inventory/bag-items';
import type { Inventory } from '@halloween/shared/goods/goods';
import type { TreeState } from '@halloween/shared/skill-tree/types/skill-tree';
import type { PlayerCommands } from '@halloween/game-ui/session/player-commands';

/**
 * Props for ListPanel.
 */
interface ListPanelProps {
  /**
   * Which list.
   */
  which: 'bag' | 'craft';

  /**
   * Whether a TV controller is held (no header; crafting shows details beside the list; smaller bag slots).
   */
  padHeld: boolean;

  /**
   * What the player carries.
   */
  inventory: Inventory;

  /**
   * What's equipped and in the bag.
   */
  gear: Gear;

  /**
   * The player's skill tree.
   */
  tree: TreeState;

  /**
   * The level of the anvil in reach (null without one).
   */
  anvil: number | null;

  /**
   * Why the last build failed, shown briefly.
   */
  buildError: string | null;

  /**
   * The player's commands.
   */
  commands: PlayerCommands;

  /**
   * Panics, closing the list.
   */
  onPanic: () => void;

  /**
   * Starts building from a bag slot.
   */
  onPlace: (slot: number) => void;
}

/**
 * The bag or craft list, with a header and Panic button (without a TV
 * controller) and the last build error under it.
 *
 * @param {ListPanelProps} props - Component props.
 * @returns {React.JSX.Element} The rendered list.
 */
function ListPanel({ which, padHeld, inventory, gear, tree, anvil, buildError, commands, onPanic, onPlace }: ListPanelProps): React.JSX.Element {
  return (
    <>
      {!padHeld && (
        <div className='flex shrink-0 items-center justify-between'>
          <span className='font-medium text-sm text-foreground'>{which === 'bag' ? 'Bag' : 'Craft'}</span>
          <PanicButton onPanic={onPanic} />
        </div>
      )}
      {padHeld && which === 'craft' ? (
        <CraftPanel
          aside
          inventory={inventory}
          gear={gear}
          tree={tree}
          anvil={anvil}
          onCraft={commands.craft} />
      ) : (
        <div className='scrollbar-none min-h-0 flex-1 touch-pan-y overflow-y-auto'>
          {which === 'craft' ? (
            <CraftPanel
              inventory={inventory}
              gear={gear}
              tree={tree}
              anvil={anvil}
              onCraft={commands.craft} />
          ) : (
            <BagPanel
              gear={gear}
              inventory={inventory}
              tree={tree}
              onEquip={commands.equip}
              onDrink={commands.drink}
              onUnequip={commands.unequip}
              onMove={commands.move}
              onDropItem={commands.dropGear}
              onPlace={onPlace}
              slotSize={padHeld ? BAG_SLOT_SIZE : undefined} />
          )}
        </div>
      )}
      <BuildError error={buildError} />
    </>
  );
}

export default ListPanel;
