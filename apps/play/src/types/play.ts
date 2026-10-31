// Types
import type { DisplaySettings } from '@halloween/renderer/types/display-settings';
import type { GearItem } from '@halloween/shared/inventory/bag-items';
import type { ClientMessage } from '@halloween/shared/protocol/messages/client-message';
import type { TreeState } from '@halloween/shared/skill-tree/types/skill-tree';

/**
 * The full-screen menus, in the order LB and RB step through them.
 */
export type Menu = 'bag' | 'craft' | 'armory' | 'tree' | 'settings';

/**
 * The Settings menu's tabs, top to bottom.
 */
export type SettingsTab = 'gameplay' | 'graphics' | 'controls' | 'audio';

/**
 * How a /play screen looks, sounds, and plays: how many tiles of ground it
 * shows top to bottom, how the world is drawn, how big its menus are, and
 * what each key and controller button does.
 */
export interface PlaySettings {
  /**
   * Tiles of ground shown top to bottom.
   */
  zoom: number;

  /**
   * How big a pixel is at the closest zoom, in screen pixels; pixels shrink
   * with the zoom from there (`playPixelScale`).
   */
  pixelSize: number;

  /**
   * How much the screen-fitted menus are scaled (UI_SCALE_MIN to
   * UI_SCALE_MAX).
   */
  uiScale: number;

  /**
   * How the world and its overlays are drawn (`WorldRenderer.setDisplaySettings`).
   */
  display: DisplaySettings;

  /**
   * How far ahead of the player the camera looks, as a share of half the
   * ground in view (`WorldRenderer.setFollowLead`).
   */
  cameraLead: number;

  /**
   * How fast the camera's lead swings round when the player turns, per
   * second (`WorldRenderer.setFollowLeadSpeed`).
   */
  cameraLeadSpeed: number;

  /**
   * Whether hurts, deaths, and pickups rumble the controller.
   */
  rumble: boolean;

  /**
   * The sound effects volume, 0..1.
   */
  sfxVolume: number;

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
export type KeyAction = 'up' | 'left' | 'down' | 'right' | 'attack' | 'use' | 'block' | 'rotate' | 'look' | 'bag' | 'craft' | 'armory' | 'tree' | 'settings';

/**
 * What a controller button can do (the sticks always walk and aim). Buttons
 * are standard-mapping indexes, so they go by position.
 */
export type PadAction = 'attack' | 'use' | 'block' | 'bag' | 'craft' | 'tree' | 'settings';

/**
 * The menu sizes saved before UI scale became a slider (see MENU_SIZES).
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
   * Whether a bone digger or station is open (USE).
   */
  using: boolean;

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
   * Steps the wall being built to its next (1) or previous (-1) look.
   */
  cycleStyle: (dir: 1 | -1) => void;

  /**
   * The menus offered, in order: MENUS without the Armory until an anvil
   * is available (`armoryOpen`).
   */
  menus: Menu[];

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
   * The equipped weapon (with its infusion), if any.
   */
  weapon: GearItem | null;

  /**
   * The player's skill tree.
   */
  tree: TreeState;
}

/**
 * A key, click, or button as `BindingGlyph` draws it: a key or click
 * (`KeyboardEvent.code` or `Mouse0`..`Mouse2`), a pad button
 * (standard-gamepad index), or the D-pad as a whole (`any`) or its left
 * and right together.
 */
export type Binding = { code: string } | { button: number } | { dpad: 'any' | 'left-right' };

/**
 * What the USE prompt shows: the key or button, and what it does.
 */
export interface UsePromptShown {
  /**
   * The key or button.
   */
  binding: Binding;

  /**
   * What it does, such as 'Open Sawmill'.
   */
  label: string;
}
