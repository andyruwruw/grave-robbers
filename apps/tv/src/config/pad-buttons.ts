/**
 * RT hits. Buttons go by standard-mapping position, so they hold whatever
 * the labels say.
 */
export const BUTTON_ACT = 7;

/**
 * B: panics.
 */
export const BUTTON_PANIC = 1;

/**
 * A: USE on the facing tile (opens or works it without hurting it).
 */
export const BUTTON_USE = 0;

/**
 * The west face button: opens the bag on the phone.
 */
export const BUTTON_BAG = 2;

/**
 * The north face button: opens crafting on the phone.
 */
export const BUTTON_CRAFT = 3;

/**
 * Back (Minus, View): opens the skill tree on the phone.
 */
export const BUTTON_TREE = 8;

/**
 * LB: turns what's being built left.
 */
export const BUTTON_TURN_LEFT = 4;

/**
 * RB: turns what's being built right.
 */
export const BUTTON_TURN_RIGHT = 5;

/**
 * LB or LT: blocks.
 */
export const BUTTONS_BLOCK = [4, 6];

/**
 * How often (ms) the pads are read.
 */
export const PAD_POLL_MS = 33;

/**
 * How often (ms) the console log of what the browser reports is checked
 * for changes (`[pads]` lines, for finding out why a controller isn't
 * seen or does nothing).
 */
export const PAD_LOG_MS = 250;
