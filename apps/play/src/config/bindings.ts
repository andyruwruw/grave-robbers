// Types
import type {
  KeyAction,
  MenuSize,
  PadAction,
} from '../types/play';

/**
 * Every key action, in the order Settings lists them.
 */
export const KEY_ACTIONS: KeyAction[] = ['up', 'left', 'down', 'right', 'attack', 'use', 'block', 'rotate', 'look', 'bag', 'craft', 'armory', 'tree', 'settings'];

/**
 * Every controller action, in the order Settings lists them.
 */
export const PAD_ACTIONS: PadAction[] = ['attack', 'use', 'block', 'bag', 'craft', 'tree', 'settings'];

/**
 * Each action's name in Settings.
 */
export const ACTION_LABELS: Record<KeyAction, string> = {
  up: 'Walk up',
  left: 'Walk left',
  down: 'Walk down',
  right: 'Walk right',
  attack: 'Attack, work',
  use: 'Use, open',
  block: 'Shield',
  rotate: 'Rotate (building)',
  look: 'Wall look (building)',
  bag: 'Bag',
  craft: 'Craft',
  armory: 'Armory',
  tree: 'Skill tree',
  settings: 'Settings',
};

/**
 * WASD walks, left click hits, right click uses (opens or works what's in
 * front without hurting it), Left Shift shields, and letters open the
 * menus (F the Armory, Esc the settings).
 */
export const DEFAULT_KEYS: Record<KeyAction, string> = {
  up: 'KeyW',
  left: 'KeyA',
  down: 'KeyS',
  right: 'KeyD',
  attack: 'Mouse0',
  use: 'Mouse2',
  block: 'ShiftLeft',
  rotate: 'KeyR',
  look: 'KeyG',
  bag: 'KeyE',
  craft: 'KeyQ',
  armory: 'KeyF',
  tree: 'KeyT',
  settings: 'Escape',
};

/**
 * RT hits, A uses, LB shields, the west face button opens the bag, north
 * crafting, Back the tree, and Start the settings.
 */
export const DEFAULT_PAD: Record<PadAction, number> = { attack: 7, use: 0, block: 4, bag: 2, craft: 3, tree: 8, settings: 9 };

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
export const ZOOM_MAX = 22;

/**
 * How far one zoom press goes, in tiles.
 */
export const ZOOM_STEP = 2;

/**
 * The Pixel size setting's range: how big a pixel is at the closest zoom,
 * in screen pixels (1 is no pixelation). Pixels shrink from there to
 * PIXEL_SIZE_FAR at the farthest zoom (see `playPixelScale`).
 */
export const PIXEL_SIZE_MIN = 1;

/**
 * The largest Pixel size (see PIXEL_SIZE_MIN).
 */
export const PIXEL_SIZE_MAX = 12;

/**
 * The Pixel size a new /play screen starts with.
 */
export const PIXEL_SIZE_DEFAULT = 8;

/**
 * How big a pixel is at the farthest zoom, in screen pixels: the game's
 * original fixed size.
 */
export const PIXEL_SIZE_FAR = 3;

/**
 * How much each of the old menu sizes scaled the screen-fitted UI: a
 * settings save from before the UI scale slider maps through this, and
 * its smallest and largest are the slider's range.
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
