// Packages
import React from 'react';
import ArmoryPanel from '@halloween/game-ui/components/armory/armory-panel';
import BagPanel from '@halloween/game-ui/components/bag/bag-panel';
import CraftPanel from '@halloween/game-ui/components/craft/craft-panel';
import TreePanel from '@halloween/game-ui/components/tree/tree-panel';

// Local Imports
import SettingsPanel from '../settings/settings-panel';
import MenuTabs from './menu-tabs';

// Types
import type { Gear } from '@halloween/shared/inventory/bag-items';
import type { Inventory } from '@halloween/shared/goods/goods';
import type { TreeState } from '@halloween/shared/skill-tree/types/skill-tree';
import type { PlayerCommands } from '@halloween/game-ui/session/player-commands';
import type {
  Capture,
  KeyAction,
  Menu,
  PlaySettings,
} from '../../types/play';

/**
 * Props for PlayMenu.
 */
interface PlayMenuProps {
  /**
   * The menus offered (the Armory only once an anvil is available).
   */
  menus: Menu[];

  /**
   * The open menu.
   */
  menu: Menu;

  /**
   * Opens a menu, or closes it (null).
   */
  onMenu: (menu: Menu | null) => void;

  /**
   * Set to the menu's frame, for the selection.
   */
  menuRef: React.RefObject<HTMLDivElement | null>;

  /**
   * The device used last.
   */
  device: 'pad' | 'keys';

  /**
   * The key or button bound to an action, by name.
   */
  bound: (a: KeyAction) => string;

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
   * What a research table in reach takes off upgrades (0 without one).
   */
  research: number;

  /**
   * The level of the anvil in reach (null without one).
   */
  anvil: number | null;

  /**
   * Why the last build or infusion failed, shown briefly.
   */
  buildError: string | null;

  /**
   * The player's commands.
   */
  commands: PlayerCommands;

  /**
   * Starts building from a bag slot.
   */
  onPlace: (slot: number) => void;

  /**
   * Panics, closing the menu.
   */
  onPanic: () => void;

  /**
   * The screen's settings.
   */
  settings: PlaySettings;

  /**
   * Changes and saves the settings.
   */
  onSettings: (next: PlaySettings) => void;

  /**
   * The binding waiting for a key or button, if any.
   */
  capturing: Capture | null;

  /**
   * Starts or stops waiting for a key or button.
   */
  onCapture: (capture: Capture | null) => void;

  /**
   * The last transfer code the server gave, or null.
   */
  transfer: { code: string; until: number } | null;
}

/**
 * The open /play menu over the world: a dimmed backdrop (clicking it
 * closes the menu), then a frame with the menu tabs and the Bag, Craft,
 * Armory, Skill tree, or Settings.
 *
 * @param {PlayMenuProps} props - Component props.
 * @returns {React.JSX.Element} The rendered menu.
 */
function PlayMenu({ menus, menu, onMenu, menuRef, device, bound, inventory, gear, tree, research, anvil, buildError, commands, onPlace, onPanic, settings, onSettings, capturing, onCapture, transfer }: PlayMenuProps): React.JSX.Element {
  return (
    <div className='absolute inset-0 z-10 flex items-center justify-center p-md'>
      <div
        className='absolute inset-0 bg-background opacity-40'
        onClick={(): void => onMenu(null)} />
      <div
        ref={menuRef}
        className='relative flex h-full max-h-[400px] w-full max-w-[760px] flex-col overflow-hidden rounded-md border border-border'
        style={{ backgroundColor: 'color-mix(in srgb, var(--arw-bg) 86%, transparent)' }}>
        <MenuTabs
          menu={menu}
          device={device}
          bound={bound}
          onMenu={onMenu}
          menus={menus} />
        {menu === 'bag' ? (
          <div className='scrollbar-none flex min-h-0 flex-1 flex-col overflow-y-auto p-md'>
            <div className='mx-auto my-auto w-full max-w-[320px]'>
              <BagPanel
                gear={gear}
                inventory={inventory}
                tree={tree}
                onEquip={commands.equip}
                onDrink={commands.drink}
                onUnequip={commands.unequip}
                onMove={commands.move}
                onDropItem={commands.dropGear}
                onPlace={onPlace} />
            </div>
          </div>
        ) : menu === 'craft' ? (
          <div className='flex min-h-0 flex-1 p-md'>
            <CraftPanel
              aside
              inventory={inventory}
              gear={gear}
              tree={tree}
              anvil={anvil}
              onCraft={commands.craft} />
          </div>
        ) : menu === 'armory' ? (
          <div className='flex min-h-0 flex-1 p-md'>
            <ArmoryPanel
              embedded
              inventory={inventory}
              gear={gear}
              tree={tree}
              anvil={anvil}
              error={buildError}
              onInfuse={commands.infuse} />
          </div>
        ) : menu === 'tree' ? (
          <div className='flex min-h-0 flex-1 flex-col p-md'>
            <TreePanel
              embedded
              hoverDetails
              inventory={inventory}
              bag={gear.bag}
              tree={tree}
              research={research}
              onUpgrade={commands.upgrade}
              onBack={(): void => onMenu(null)}
              onPanic={onPanic} />
          </div>
        ) : (
          <div className='flex min-h-0 flex-1 p-md'>
            <SettingsPanel
              settings={settings}
              onChange={onSettings}
              capturing={capturing}
              onCapture={onCapture}
              transfer={transfer}
              onTransfer={commands.transferCode}
              onLeave={(): void => {
                onMenu(null);
                commands.leave();
              }} />
          </div>
        )}
      </div>
    </div>
  );
}

export default PlayMenu;
