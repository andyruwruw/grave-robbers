// Types
import type { Menu } from '../types/play';

/**
 * The full-screen menus, in the order LB and RB step through them.
 */
export const MENUS: Menu[] = ['bag', 'craft', 'armory', 'tree', 'settings'];

/**
 * Each menu's name.
 */
export const MENU_LABELS: Record<Menu, string> = { bag: 'Bag', craft: 'Craft', armory: 'Armory', tree: 'Skill tree', settings: 'Settings' };

/**
 * Standard-mapping gamepad buttons the menus use (not rebindable): A
 * presses, B closes, LB and RB switch menus, and the D-pad moves.
 */
export const PAD = { a: 0, b: 1, lb: 4, rb: 5, up: 12, down: 13, left: 14, right: 15 } as const;

/**
 * How far from the player (in tiles) the mouse has to be before it aims.
 */
export const MOUSE_AIM_MIN = 0.3;

/**
 * How high (world units) over the ground the USE prompt floats over what
 * it points at.
 */
export const USE_PROMPT_LIFT = 1.4;

/**
 * Round trip (ms) assumed until the first ping comes back.
 */
export const DEFAULT_PING_MS = 100;

/**
 * How often (ms) movement is sent.
 */
export const SEND_MS = 33;

/**
 * How long (ms) a held direction waits in a menu before it repeats.
 */
export const REPEAT_FIRST_MS = 350;

/**
 * How often (ms) a held direction repeats in a menu after that.
 */
export const REPEAT_MS = 110;

/**
 * Menu scroll speed with the right stick, in px per frame at full tilt.
 */
export const SCROLL_SPEED = 14;

/**
 * Screen height (css px) the menus are laid out for; taller screens scale
 * them up so the phone-sized panels read from the couch.
 */
export const UI_HEIGHT = 430;

/**
 * The Settings menu's button classes, before each button's own colors.
 */
export const SETTINGS_BUTTON = 'flex items-center justify-center gap-1.5 rounded-md border px-sm py-1.5 font-medium text-[13px]';

/**
 * How coarse /play's pixelated HUD is next to the world (`usePixelHud`):
 * its pixels are this share of the world's, so the hearts and counts read
 * a little sharper than the graveyard.
 */
export const HUD_PIXEL_SHARE = 0.5;

/**
 * /play's top bar hearts and candy and blood icons, in pixels: big enough
 * to stay readable once the world's pixelation coarsens them.
 */
export const HUD_HEART_PX = 30;

/**
 * The candy and blood icons' size in /play's top bar (see HUD_HEART_PX).
 */
export const HUD_RESOURCE_PX = 38;
