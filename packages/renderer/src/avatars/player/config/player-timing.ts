// Packages
import { STRIKE_DELAY } from '@halloween/shared/players/combat';

/**
 * Jumping off a ledge: a hop over JUMP_TIME seconds, tucked, arms up, then
 * a squash on landing.
 */
export const JUMP_TIME = 0.55;

/**
 * How high a jump off a ledge hops.
 */
export const JUMP_HOP = 0.45;

/**
 * Seconds the landing squash takes.
 */
export const LAND_TIME = 0.16;

/**
 * How fast a player whose phone went away slumps down (and gets back up),
 * per second.
 */
export const SLUMP_SPEED = 2.5;

/**
 * Axe swing (fits inside the 0.5s attack cooldown): total duration. The
 * strike lands when the server applies the hit.
 */
export const SWING_TIME = 0.44;

/**
 * Seconds a swing started ahead of the server waits for the server's own
 * (about a round trip plus the windup).
 */
export const PREDICTED_SWING_WAIT = 0.8;

/**
 * Where the wind-up ends, as a fraction of the swing.
 */
export const WINDUP_END = 0.28;

/**
 * Where the hang at the top ends, as a fraction of the swing.
 */
export const HANG_END = 0.38;

/**
 * Where the strike ends (when the server applies the hit), as a fraction
 * of the swing.
 */
export const STRIKE_END = STRIKE_DELAY / SWING_TIME;

/**
 * Where the held impact ends, as a fraction of the swing.
 */
export const IMPACT_END = 0.62;

/**
 * How long after a lash ends (in swing lengths past phase 1) the morning
 * star takes to wind back into its resting coil.
 */
export const COIL_IN = 0.8;

/**
 * How high a charged gauntlet's super uppercut launches the player.
 */
export const SUPER_HOP = 1.2;

/**
 * How fast the repeating crossbow's drum spins up when it fires (radians
 * per second, easing off).
 */
export const DRUM_SPIN = 30;

/**
 * How fast the free arm cranks a reloading crossbow, in radians per second.
 */
export const RELOAD_CRANK = 12;

/**
 * Seconds a crossbow reload takes to ease in.
 */
export const RELOAD_EASE = 0.15;

/**
 * Guns kick up when they fire, over this many seconds.
 */
export const SHOT_TIME = 0.3;

/**
 * How fast the shield arm comes up to block, per second.
 */
export const BLOCK_RATE = 14;

/**
 * How often spawn protection pulses, per second. The body dims and
 * recovers (never see-through, since the overlapping boxes flicker when
 * drawn transparent, and never brighter, so it doesn't strobe under
 * bloom).
 */
export const PROTECTION_PULSE_RATE = 2;

/**
 * How far spawn protection dims the body.
 */
export const PROTECTION_DIM = 0.45;

/**
 * How fast the measured velocity is smoothed, per second.
 */
export const RUN_SMOOTHING = 9;

/**
 * The streak the axe blade leaves through the air during the strike: pool
 * size.
 */
export const TRAIL_POOL = 48;

/**
 * How long each streak bit lingers, in seconds.
 */
export const TRAIL_LIFE = 0.24;

/**
 * A fresh streak bit's size, in world units.
 */
export const TRAIL_SIZE = 0.22;

/**
 * How many bits fill the gap between frames so the streak stays solid.
 */
export const TRAIL_STEPS = 6;

/**
 * How long after its last pulse the Hellmouth still counts as spraying,
 * in seconds (its pulses come every `spray.bloodEvery`, 0.5s).
 */
export const SPRAY_HOLD = 0.6;

/**
 * How long the arm takes to settle after a spray stops, in seconds.
 */
export const SPRAY_EASE = 0.25;
