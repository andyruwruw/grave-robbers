// Packages
import { useEffect, useState } from 'react';
import { isBuildItem } from '@halloween/shared/inventory/bag-items';

// Types
import type { BagItem, BuildItem } from '@halloween/shared/inventory/bag-items';
import type { PadInfo } from '@halloween/shared/protocol/pads';
import type { PlayerCommands } from '@halloween/game-ui/session/player-commands';
import type { Panel } from '../types/pad';

/**
 * What `usePadPanels` gives the pad.
 */
export interface PadPanels {
  /**
   * Whether the TV controllers popover is open.
   */
  padMenu: boolean;

  /**
   * Opens or closes the TV controllers popover.
   */
  setPadMenu: (open: boolean) => void;

  /**
   * The open list, if any.
   */
  panel: Panel | null;

  /**
   * Opens a list, or closes it (null).
   */
  setPanel: (panel: Panel | null) => void;

  /**
   * The bag slot being built from, if any.
   */
  placing: number | null;

  /**
   * Sets the bag slot being built from.
   */
  setPlacing: (slot: number | null) => void;

  /**
   * Opens a list, or closes it if it's open (without a TV controller); stops building.
   */
  toggle: (next: Panel) => void;

  /**
   * Panics, closing whatever menu is open.
   */
  panic: () => void;

  /**
   * Starts building from a bag slot.
   */
  startBuilding: (slot: number) => void;

  /**
   * Stops building and goes back to the bag.
   */
  stopBuilding: () => void;

  /**
   * The list showing (with a TV controller held, one is always open).
   */
  shown: Panel | null;

  /**
   * What's being built, while it's still a build item.
   */
  building: BuildItem | null;
}

/**
 * Which of the pad's lists is open, and building: the bag, crafting, or
 * the skill tree (one always open while a TV controller is held), what's
 * being built from the bag, and the TV controllers popover. Dying closes
 * everything, a slot that stops being a build item stops building, and the
 * held controller's face buttons switch lists (`padMenuRequest`).
 *
 * @param pads - The TV's controllers.
 * @param myPad - The one this player holds, if any.
 * @param dead - Whether the player is dead.
 * @param bag - The bag.
 * @param padMenuRequest - The last list the held controller asked for.
 * @param commands - The player's commands.
 * @returns The panel state and what changes it.
 */
export function usePadPanels(
  pads: PadInfo[],
  myPad: PadInfo | null,
  dead: boolean,
  bag: (BagItem | null)[],
  padMenuRequest: { menu: Panel; id: number } | null,
  commands: PlayerCommands,
): PadPanels {
  const [padMenu, setPadMenu] = useState(false);
  useEffect(() => {
    if (pads.length === 0) {
      setPadMenu(false);
    }
  }, [pads.length]);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [placing, setPlacing] = useState<number | null>(null);

  useEffect(() => {
    if (dead) {
      setPanel(null);
      setPlacing(null);
    }
  }, [dead]);

  const placingItem = placing !== null ? bag[placing] : null;
  useEffect(() => {
    if (placing !== null && !(placingItem && isBuildItem(placingItem))) {
      setPlacing(null);
    }
  }, [placing, placingItem]);

  /**
   * Opens a panel, or closes it if it's already open (phones without a TV pad), and stops any building.
   *
   * @param next - The panel to open.
   */
  const toggle = (next: Panel): void => {
    setPanel(myPad || panel !== next ? next : null);
    if (placing !== null) {
      setPlacing(null);
      commands.buildSelect(null);
    }
  };

  /**
   * Panic closes whatever menu is open, so the player can see what's
   * coming.
   */
  const panic = (): void => {
    commands.panic();
    setPanel(null);
    if (placing !== null) {
      setPlacing(null);
      commands.buildSelect(null);
    }
  };

  useEffect(() => {
    if (!padMenuRequest) {
      return;
    }
    setPanel(padMenuRequest.menu);
    if (placing !== null) {
      setPlacing(null);
      commands.buildSelect(null);
    }
  }, [padMenuRequest?.id]);

  /**
   * Starts placing the item in a bag slot and closes the panel.
   *
   * @param slot - The bag slot.
   */
  const startBuilding = (slot: number): void => {
    setPlacing(slot);
    commands.buildSelect(slot);
    setPanel(null);
  };

  /**
   * Stops placing and goes back to the bag.
   */
  const stopBuilding = (): void => {
    setPlacing(null);
    commands.buildSelect(null);
    commands.aim(0, 0);
    setPanel('bag');
  };

  const shown: Panel | null = myPad ? panel ?? 'bag' : panel;
  const building = placingItem && isBuildItem(placingItem) ? placingItem : null;

  return { padMenu, setPadMenu, panel, setPanel, placing, setPlacing, toggle, panic, startBuilding, stopBuilding, shown, building };
}
