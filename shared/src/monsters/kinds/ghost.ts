/**
 * Seconds a ghost must sit inside a light to snuff it, and how long a
 * player standing in the light scares it off for.
 */
export const GHOST_SNUFF_TIME = 3;

/**
 * Seconds a player standing in a light scares a ghost off for.
 */
export const GHOST_SCARE_TIME = 4;

/**
 * Ghosts lob slow balls of ectoplasm at anyone within GHOST_SHOT_RANGE
 * tiles, one every GHOST_SHOT_COOLDOWN seconds (give or take a quarter).
 * A hit does a little damage and slows the player to GHOST_SLOW of their
 * speed for GHOST_SLOW_SECONDS. The balls drift through walls (the ghosts
 * themselves don't), but they're slow enough to step out of the way.
 */
export const GHOST_SHOT_RANGE = 5;

/**
 * A ghost that sees someone within its sight gets angry and drifts after
 * them, keeping about GHOST_KEEP tiles away, until they're GHOST_FORGET
 * tiles off. Weapons barely hurt one (GHOST_DAMAGE of a hit's damage, at
 * least 1) but knock it GHOST_KNOCKBACK times as far.
 */
export const GHOST_KEEP = 2.5;

/**
 * Tiles off a player must get for an angry ghost to forget them.
 */
export const GHOST_FORGET = 9;

/**
 * Fraction of a hit's damage a ghost takes (at least 1).
 */
export const GHOST_DAMAGE = 0.25;

/**
 * How many times as far hits knock a ghost.
 */
export const GHOST_KNOCKBACK = 2;

/**
 * Seconds between a ghost's shots (give or take a quarter).
 */
export const GHOST_SHOT_COOLDOWN = 4;

/**
 * Speed of a ghost's ectoplasm (tiles per second).
 */
export const GHOST_SHOT_SPEED = 5;

/**
 * Tiles a ball of ectoplasm flies before it fades.
 */
export const GHOST_SHOT_REACH = 8;

/**
 * Damage a ball of ectoplasm does.
 */
export const GHOST_SHOT_DAMAGE = 1;

/**
 * Fraction of their speed a player hit by ectoplasm (or standing in a witch's
 * puddle) moves at.
 */
export const GHOST_SLOW = 0.45;

/**
 * Seconds a hit by ectoplasm slows a player.
 */
export const GHOST_SLOW_SECONDS = 2.5;
