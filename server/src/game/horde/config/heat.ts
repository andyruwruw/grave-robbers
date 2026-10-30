/**
 * The share of zombies (each a chance at spawn) drawn toward where players
 * have been lately, and toward clusters of graves.
 */
export const ZOMBIE_LURES = { players: 0.3, graves: 0.3 } as const;

/**
 * The share of a lured zombie's wander picks that go to the hottest spot.
 */
export const LURE_CHANCE = 0.6;

/**
 * How many spots a lured zombie weighs for its pick.
 */
export const LURE_TRIES = 10;

/**
 * How far off a lured zombie's spots may be (tiles).
 */
export const LURE_REACH = 14;

/**
 * Player heat fades with this time constant (seconds).
 */
export const PLAYER_HEAT_MEMORY = 180;

/**
 * Graves within this many tiles warm a tile's grave heat.
 */
export const GRAVE_HEAT_RADIUS = 3;

/**
 * Grave heat is recounted this often (seconds).
 */
export const GRAVE_HEAT_REFRESH = 10;
