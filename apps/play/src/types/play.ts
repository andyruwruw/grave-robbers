// Types
import type { GearKind } from '@halloween/shared/gear/types/gear-def';
import type { ClientMessage } from '@halloween/shared/protocol/messages/client-message';
import type { TreeState } from '@halloween/shared/skill-tree/types/skill-tree';

/**
 * The full-screen menus, in the order LB and RB step through them.
 */
export type Menu = 'bag' | 'craft' | 'tree' | 'settings';

/**
 * How a /play screen looks and plays: how many tiles of ground it shows top
 * to bottom, how big its menus are, and what each key and controller
 * button does.
 */
export interface PlaySettings {
  /**
   * Tiles of ground shown top to bottom.
   */
  zoom: number;

  /**
   * How big the menus are.
   */
  menuSize: MenuSize;

  /**
   * The key (or click) bound to each action.
   */
  keys: Record<KeyAction, string>;

  /**
   * The controller button bound to each action.
   */
  pad: Record<PadAction, number>;
}

/**
 * What a key (or mouse button) can do. Keys are `KeyboardEvent.code`s, or
 * `Mouse0` (left), `Mouse1` (middle), and `Mouse2` (right) for clicks.
 */
export type KeyAction = 'up' | 'left' | 'down' | 'right' | 'attack' | 'block' | 'rotate' | 'bag' | 'craft' | 'tree' | 'settings';

/**
 * What a controller button can do (the sticks always walk and aim). Buttons
 * are standard-mapping indexes, so they go by position.
 */
export type PadAction = 'attack' | 'block' | 'bag' | 'craft' | 'tree' | 'settings';

/**
 * How big the menus are.
 */
export type MenuSize = 'small' | 'medium' | 'large';

/**
 * Which binding is waiting for a key or button, if any.
 */
export type Capture =
  /**
   * A key or click for a key action.
   */
  | { device: 'keys'; action: KeyAction }
  /**
   * A controller button for a pad action.
   */
  | { device: 'pad'; action: PadAction };

/**
 * A D-pad direction.
 */
export type NavDir = 'up' | 'down' | 'left' | 'right';

/**
 * The page's latest state and actions, which the input loop and the key
 * listeners read each frame without re-rendering.
 */
export interface LiveState {
  /**
   * Whether the player has joined.
   */
  joined: boolean;

  /**
   * The open menu, if any.
   */
  menu: Menu | null;

  /**
   * Whether a structure is being built.
   */
  building: boolean;

  /**
   * Whether a storage chest is open.
   */
  stash: boolean;

  /**
   * Whether the player is dead.
   */
  dead: boolean;

  /**
   * Sends on the controller socket.
   */
  send: (msg: ClientMessage) => void;

  /**
   * Panics, closing the menu.
   */
  panic: () => void;

  /**
   * Stops building and opens the bag.
   */
  stopBuilding: () => void;

  /**
   * Opens a menu, or closes it (null).
   */
  setMenu: (menu: Menu | null) => void;

  /**
   * The screen's settings.
   */
  settings: PlaySettings;

  /**
   * Changes and saves the settings.
   */
  changeSettings: (next: PlaySettings) => void;

  /**
   * The binding waiting for a key or button, if any.
   */
  capturing: Capture | null;

  /**
   * Starts or stops waiting for a key or button.
   */
  setCapturing: (capture: Capture | null) => void;

  /**
   * The player's id, once joined.
   */
  playerId: string | null;

  /**
   * The equipped weapon, if any.
   */
  weapon: GearKind | null;

  /**
   * The player's skill tree.
   */
  tree: TreeState;
}
