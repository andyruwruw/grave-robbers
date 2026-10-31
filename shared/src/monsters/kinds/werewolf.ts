/**
 * A werewolf's pounce: from WEREWOLF_POUNCE_MIN to its `range` tiles off it
 * leaps WEREWOLF_LEAP tiles along its aim in WEREWOLF_LEAP_TIME seconds,
 * at most once every WEREWOLF_POUNCE_EVERY seconds. Up close it claws.
 */
export const WEREWOLF_LEAP = 5;

/**
 * Seconds a werewolf's leap takes.
 */
export const WEREWOLF_LEAP_TIME = 0.34;

/**
 * Closest a werewolf pounces from (tiles).
 */
export const WEREWOLF_POUNCE_MIN = 2.2;

/**
 * Seconds between a werewolf's pounces.
 */
export const WEREWOLF_POUNCE_EVERY = 2;

/**
 * Seconds a werewolf's pounce winds up (it crouches low).
 */
export const WEREWOLF_POUNCE_WINDUP = 0.45;

/**
 * Share of a hit's knockback a werewolf takes.
 */
export const WEREWOLF_KNOCKBACK = 0.5;

/**
 * Werewolves come only with a blood moon (its `spawn-mix` effect). Once
 * the moon sets, the ones it brought run from the nearest player and are
 * gone when none is within WEREWOLF_GONE tiles, or after
 * WEREWOLF_FLEE_SECONDS.
 */
export const WEREWOLF_GONE = 14;

/**
 * Seconds a werewolf runs after the moon sets before it's gone anyway.
 */
export const WEREWOLF_FLEE_SECONDS = 12;

/**
 * Between pounces, a werewolf within pouncing distance circles its prey
 * instead of running straight in: it lopes sideways at
 * WEREWOLF_STRAFE_SPEED of its speed, edging WEREWOLF_STRAFE_IN radians
 * inward, and switches sides every WEREWOLF_STRAFE_FLIP seconds (plus up to
 * as much again at random) or when something blocks it.
 */
export const WEREWOLF_STRAFE_SPEED = 0.75;

/**
 * How far (radians) a strafing werewolf angles in toward its prey.
 */
export const WEREWOLF_STRAFE_IN = 0.35;

/**
 * Least seconds a werewolf strafes one way before switching.
 */
export const WEREWOLF_STRAFE_FLIP = 0.8;
