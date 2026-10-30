/**
 * Seconds of snapshot positions kept for interpolation.
 */
export const TRAIL_KEEP = 1;

/**
 * How far (tiles) from a struck monster the striker can be: the longest
 * melee reach, with some slack for movement.
 */
export const STRIKER_RANGE = 3.2;

/**
 * How high a health bar floats over a monster's head.
 */
export const MONSTER_BAR_LIFT = 1.05;

/**
 * How high the TV's mouse holds up a player or monster.
 */
export const LIFT_HEIGHT = 1.2;

/**
 * How fast something held up rises and settles (per second).
 */
export const LIFT_SPEED = 6;

/**
 * How close (in tiles, on screen) a click must land to grab a player or
 * monster.
 */
export const GRAB_RADIUS = 0.7;

/**
 * Height above a player's feet that they hang from when held up (about the
 * top of their head).
 */
export const PLAYER_PIVOT = 0.85;

/**
 * Height above a monster's feet that it hangs from when held up.
 */
export const MONSTER_PIVOT = 0.8;
