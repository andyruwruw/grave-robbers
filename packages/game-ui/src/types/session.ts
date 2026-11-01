// Types
import type { BagItem, Gear } from '@halloween/shared/inventory/bag-items';
import type { Inventory } from '@halloween/shared/goods/goods';
import type { ClientMessage } from '@halloween/shared/protocol/messages/client-message';
import type { PadInfo } from '@halloween/shared/protocol/pads';
import type { PlayerIdentity } from '@halloween/shared/protocol/state/player-state';
import type { UsePanel } from '@halloween/shared/protocol/state/use-panel';
import type { Vitals } from '@halloween/shared/protocol/state/vitals';
import type { TreeState } from '@halloween/shared/skill-tree/types/skill-tree';
import type { PickupToast } from './toasts';

/**
 * A buzz: one length in ms, or on/off lengths like `navigator.vibrate`.
 */
export type Rumble = number | number[];

/**
 * A TV controller asking the phone to open one of its menus.
 */
export interface PadMenuRequest {
  /**
   * The menu to open.
   */
  menu: 'bag' | 'craft' | 'tree' | 'armory';

  /**
   * When it was asked (ms), so asking twice opens it again.
   */
  id: number;
}

/**
 * A player kill being punished: the candy it cost.
 */
export interface NaughtyNotice {
  /**
   * When it happened (ms), so each one plays afresh.
   */
  id: number;

  /**
   * The candy the kill cost.
   */
  candy: number;
}

/**
 * Everything a controller (the phone, or /play) knows about its player.
 */
export interface ControllerSession {
  /**
   * Whether the server has said hello back.
   */
  welcomed: boolean;

  /**
   * The player this controller plays, null before joining.
   */
  identity: PlayerIdentity | null;

  /**
   * Why the last join failed, if it did.
   */
  joinError: string | null;

  /**
   * Whether a join request is in flight.
   */
  joining: boolean;

  /**
   * Whether the last join was for a name that has a character, so the form
   * asks for a transfer code.
   */
  needsCode: boolean;

  /**
   * The last transfer code the server gave, and when it stops working (ms
   * since the epoch), or null.
   */
  transfer: { code: string; until: number } | null;

  /**
   * Candy and blood carried.
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
   * The level of the anvil in reach, null without one.
   */
  anvil: number | null;

  /**
   * The "+6 candy" notes showing now.
   */
  toasts: PickupToast[];

  /**
   * Why the last build failed, while it shows.
   */
  buildError: string | null;

  /**
   * Health, wounds, healing, protection and death.
   */
  vitals: Vitals;

  /**
   * Wall-clock ms when a dead player rises again.
   */
  respawnAt: number;

  /**
   * The naughty screen to show, if a player kill is being punished.
   */
  naughty: NaughtyNotice | null;

  /**
   * Hides the naughty screen.
   */
  endNaughty: () => void;

  /**
   * The open storage chest's slots, null when none is open.
   */
  stash: (BagItem | null)[] | null;

  /**
   * Whether the player built the open chest (only its keeper can pick it
   * up).
   */
  stashYours: boolean;

  /**
   * The digger or station panel USE opened, null when none is open.
   */
  using: UsePanel | null;

  /**
   * The TV controllers the player can claim.
   */
  pads: PadInfo[];

  /**
   * The menu a held TV controller (or USE on a table or anvil) last asked
   * to open.
   */
  padMenu: PadMenuRequest | null;

  /**
   * Sends a message to the server.
   */
  send: (msg: ClientMessage) => void;

  /**
   * Asks to join with a name and color.
   */
  join: (name: string, color: string, code?: string) => void;
}
