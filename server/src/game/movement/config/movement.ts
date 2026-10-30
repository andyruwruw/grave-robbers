/**
 * A panicking player replans their path this often (seconds).
 */
export const PANIC_REPLAN = 0.4;

/**
 * A panicking player counts a tile this many tiles from the nearest
 * monster as safe enough.
 */
export const PANIC_SAFE = 7;

/**
 * Share of a player/monster overlap that moves the monster (the player
 * moves the rest), so players can shove zombies around.
 */
export const MONSTER_SHOVE_SHARE = 0.8;
