/**
 * How the model turns to face where the player faces: a spring with this
 * natural frequency (radians a second; higher catches up sooner).
 */
export const TURN_FREQUENCY = 16;

/**
 * The turn spring's damping ratio: under 1 lets a fast turn swing a touch
 * past and settle back (0.7 overshoots about 5%).
 */
export const TURN_DAMPING = 0.7;

/**
 * The fastest the model turns by default, in radians a second (about 690
 * degrees); the Turn speed setting (`DisplaySettings.turnSpeed`) changes it.
 */
export const MAX_TURN_SPEED = 12;

/**
 * The longest slice the turn spring is stepped in, in seconds, so a slow
 * frame can't make it wobble.
 */
export const TURN_SUBSTEP = 1 / 120;
