/**
 * Speed of a witch's lobbed potion (tiles per second).
 */
export const POTION_SPEED = 5.5;

/**
 * Tiles around where a potion bursts that it splashes.
 */
export const SPLASH_RADIUS = 1.2;

/**
 * Seconds the purple puddle a potion leaves lasts.
 */
export const PUDDLE_SECONDS = 5;

/**
 * Damage a second a puddle does to anyone standing in it (who moves at
 * GHOST_SLOW meanwhile).
 */
export const PUDDLE_DAMAGE = 1;

/**
 * A witch caught up close swings her broom instead: a wide sweep (`arc`
 * radians either side) that lands after `windup`, knocks whoever it hits
 * `knockback` tiles away, and slows them for `slow` seconds; at most one
 * every `cooldown`.
 */
export const WITCH_SWIPE = { reach: 1.3, windup: 0.4, cooldown: 1.6, arc: 1.7, damage: 3, knockback: 2.8, slow: 2 };
