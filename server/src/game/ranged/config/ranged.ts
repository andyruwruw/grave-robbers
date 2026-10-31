/**
 * Radians either side of where a crossbow points that it prefers to lock
 * onto a monster (see `AimingSystem.lockOn`).
 */
export const LOCK_CONE = 1.2;

/**
 * Bolts move this far (tiles) per collision check.
 */
export const SHOT_STEP = 0.2;

/**
 * Seconds between the Hellmouth's pulses of flame while Action is held;
 * each deals its `rate` for this long (the blood it drinks keeps its own
 * clock, `bloodEvery`).
 */
export const SPRAY_PULSE = 0.25;

/**
 * How far past a monster's body a thrown glaive's spinning blade reaches
 * (tiles).
 */
export const GLAIVE_REACH = 0.35;

/**
 * How close a returning glaive comes before its thrower catches it
 * (tiles).
 */
export const GLAIVE_CATCH = 0.6;

/**
 * Seconds past its planned flight that a glaive that can't find its way
 * back is caught anyway.
 */
export const GLAIVE_SPARE = 2;

/**
 * How far in front of a player a raised Mirror Shield catches a witch's
 * potion (tiles past their body), since potions hit nothing in flight.
 */
export const MIRROR_SHIELD_REACH = 0.6;

/**
 * Least range (tiles) a shot a Mirror Shield sent back has left.
 */
export const REFLECT_RANGE = 8;
