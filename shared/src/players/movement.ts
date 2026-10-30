/**
 * Movement speed in tiles per second.
 */
export const PLAYER_SPEED = 4;

/**
 * Panic (from the phone's skill tree screen): the player runs from any
 * monster within PANIC_RANGE tiles for PANIC_SECONDS, then walks back to
 * where they were (still dodging any monster within three quarters of that range),
 * giving up after PANIC_RETURN_SECONDS.
 */
export const PANIC_RANGE = 4;

/**
 * Seconds a panicking player runs.
 */
export const PANIC_SECONDS = 1;

/**
 * Seconds a panicked player tries walking back before giving up.
 */
export const PANIC_RETURN_SECONDS = 1;

/**
 * Collision radius in tiles.
 */
export const PLAYER_RADIUS = 0.3;

/**
 * Players walk at this fraction of their speed through a tree's trunk.
 */
export const TREE_SLOW = 0.5;
