// Packages
import { useEffect, useState } from 'react';
import { isBuildItem } from '@halloween/shared/inventory/bag-items';

// Types
import type { BagItem, BuildItem } from '@halloween/shared/inventory/bag-items';
import type { PlayerCommands } from '@halloween/game-ui/session/player-commands';
import type { Menu } from '../types/play';

/**
 * What `useBuilding` gives the page.
 */
export interface Building {
  /**
   * What's being built, while it's still a build item.
   */
  building: BuildItem | null;

  /**
   * Starts building from a bag slot, closing the menu.
   */
  startBuilding: (slot: number) => void;

  /**
   * Stops building and opens the bag.
   */
  stopBuilding: () => void;
}

/**
 * Building from the bag on /play: the slot being built from, dropped when
 * the player dies, when it stops being a build item, or when a menu opens.
 *
 * @param bag - The bag.
 * @param dead - Whether the player is dead.
 * @param menu - The open menu, if any.
 * @param setMenu - Opens or closes a menu.
 * @param commands - The player's commands.
 * @returns What's being built and how to start and stop.
 */
export function useBuilding(bag: (BagItem | null)[], dead: boolean, menu: Menu | null, setMenu: (menu: Menu | null) => void, commands: PlayerCommands): Building {
  const [placing, setPlacing] = useState<number | null>(null);

  useEffect(() => {
    if (dead) {
      setMenu(null);
      setPlacing(null);
    }
  }, [dead]);

  const placingItem = placing !== null ? bag[placing] : null;
  const building = placingItem && isBuildItem(placingItem) ? placingItem : null;
  useEffect(() => {
    if (placing !== null && !building) {
      setPlacing(null);
    }
  }, [placing, building]);

  /**
   * Starts placing the item in a bag slot and closes the menu.
   *
   * @param slot - The bag slot.
   */
  const startBuilding = (slot: number): void => {
    setPlacing(slot);
    commands.buildSelect(slot);
    setMenu(null);
  };

  /**
   * Stops placing and goes back to the bag.
   */
  const stopBuilding = (): void => {
    setPlacing(null);
    commands.buildSelect(null);
    commands.aim(0, 0);
    setMenu('bag');
  };

  useEffect(() => {
    if (menu !== null && building) {
      setPlacing(null);
      commands.buildSelect(null);
    }
  }, [menu, building, commands]);

  return { building, startBuilding, stopBuilding };
}
