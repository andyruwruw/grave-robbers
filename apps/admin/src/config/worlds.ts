/**
 * The longest name a new world slot can take.
 */
export const WORLD_NAME_MAX = 32;

/**
 * Up to this long ago (ms), a save reads as "just now".
 */
export const JUST_NOW_MS = 60_000;

/**
 * Up to this long ago (ms), a save reads in minutes or hours; past it, as a local date and time.
 */
export const RELATIVE_MS = 24 * 60 * 60_000;
