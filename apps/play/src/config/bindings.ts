// Types
import type {
  KeyAction,
  MenuSize,
  PadAction,
} from '../types/play';

/**
 * Every key action, in the order Settings lists them.
 */
export const KEY_ACTIONS: KeyAction[] = ['up', 'left', 'down', 'right', 'attack', 'block', 'rotate', 'bag', 'craft', 'tree', 'settings'];

/**
 * Every controller action, in the order Settings lists them.
 */
export const PAD_ACTIONS: PadAction[] = ['attack', 'block', 'bag', 'craft', 'tree', 'settings'];

/**
 * Each action's name in Settings.
 */
export const ACTION_LABELS: Record<KeyAction, string> = {
  up: 'Walk up',
  left: 'Walk left',
  down: 'Walk down',
  right: 'Walk right',
  attack: 'Attack, use',
  block: 'Shield',
  rotate: 'Rotate (building)',
  bag: 'Bag',
  craft: 'Craft',
  tree: 'Skill tree',
  settings: 'Settings',
};

/**
 * WASD walks, left click hits, Left Shift shields, and letters open the
 * menus (Esc the settings).
 */
export const DEFAULT_KEYS: Record<KeyAction, string> = {
  up: 'KeyW',
  left: 'KeyA',
  down: 'KeyS',
  right: 'KeyD',
  attack: 'Mouse0',
  block: 'ShiftLeft',
  rotate: 'KeyR',
  bag: 'KeyE',
  craft: 'KeyQ',
  tree: 'KeyT',
  settings: 'Escape',
};

/**
 * RT hits, LB shields, the west face button opens the bag, north
 * crafting, Back the tree, and Start the settings.
 */
export const DEFAULT_PAD: Record<PadAction, number> = { attack: 7, block: 4, bag: 2, craft: 3, tree: 8, settings: 9 };

/**
 * Standard-mapping buttons by their Xbox names.
 */
export const PAD_BUTTON_NAMES = ['A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT', 'Back', 'Start', 'Left stick', 'Right stick', 'D-pad up', 'D-pad down', 'D-pad left', 'D-pad right', 'Home'];

/**
 * The closest zoom, in tiles of ground top to bottom.
 */
export const ZOOM_MIN = 8;

/**
 * The farthest zoom, in tiles of ground top to bottom.
 */
export const ZOOM_MAX = 32;

/**
 * How far one zoom press goes, in tiles.
 */
export const ZOOM_STEP = 2;

/**
 * How much each menu size scales the screen-fitted UI.
 */
export const MENU_SIZES: Record<MenuSize, number> = { small: 0.8, medium: 1, large: 1.25 };

/**
 * Where the settings are saved.
 */
export const PLAY_STORAGE_KEY = 'graveyard.play.settings';

/**
 * Where the /play screen's player token is saved.
 */
export const PLAY_TOKEN_KEY = 'graveyard.play.token';
