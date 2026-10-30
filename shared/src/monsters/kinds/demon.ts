/**
 * Demons step through shadow: while hunting someone more than
 * DEMON_BLINK_MIN tiles off, every DEMON_BLINK_EVERY seconds (give or take
 * a third) one vanishes and reappears on a dark tile DEMON_BLINK_BEHIND
 * tiles behind its target's back. At most MAX_DEMONS are out at once.
 */
export const DEMON_BLINK_MIN = 3;

/**
 * A demon in the shadows lunges at anyone within its `range`, even
 * someone standing in light: a dash just past where they stand (at most
 * DEMON_LUNGE tiles) taking DEMON_LUNGE_TIME, raking whoever it touches.
 * Caught in the light afterwards, it slinks back to the dark.
 */
export const DEMON_LUNGE = 4;

/**
 * Seconds a demon's lunge takes.
 */
export const DEMON_LUNGE_TIME = 0.24;

/**
 * Seconds between a demon's blinks (give or take a third).
 */
export const DEMON_BLINK_EVERY = 5;

/**
 * Tiles behind its target's back a blinking demon reappears.
 */
export const DEMON_BLINK_BEHIND = 1.7;

/**
 * Most demons out at once.
 */
export const MAX_DEMONS = 2;
