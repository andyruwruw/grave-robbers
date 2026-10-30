// Packages
import { MONSTERS } from '@halloween/shared/monsters/monster-stats';

/**
 * Skin tones a brute may have.
 */
export const BRUTE_SKINS = ['#6f7f62', '#7a7468', '#5f6f66', '#857a66'];

/**
 * A brute's tusks.
 */
export const BRUTE_TUSK = '#e4dcc0';

/**
 * A brute's belt.
 */
export const BRUTE_BELT = '#3a2a1a';

/**
 * A brute's swing: its fists go up over BRUTE_WINDUP (the server's
 * telegraph), come down in BRUTE_SLAM_TIME, and it takes BRUTE_RECOVER to
 * straighten up.
 */
export const BRUTE_WINDUP = MONSTERS.brute.windup;

/**
 * Seconds a brute's fists take to come down (see BRUTE_WINDUP).
 */
export const BRUTE_SLAM_TIME = 0.12;

/**
 * Seconds a brute takes to straighten up after a slam (see BRUTE_WINDUP).
 */
export const BRUTE_RECOVER = 0.55;

/**
 * Hits barely rock a brute: this much of a zombie's flinch.
 */
export const BRUTE_HEFT = 0.3;

/**
 * How far a brute rolls onto each planted leg (its gait is slow, see GAIT).
 */
export const BRUTE_ROLL = 0.16;

/**
 * How far a brute shifts its weight onto each planted leg.
 */
export const BRUTE_SHIFT = 0.05;

/**
 * How hard a brute shakes the trees around it while walking.
 */
export const BRUTE_WALK_QUAKE = 0.25;

/**
 * How hard a brute shakes the trees at each footfall.
 */
export const BRUTE_STEP_QUAKE = 0.75;

/**
 * How hard a brute shakes the trees when its fists hit the ground.
 */
export const BRUTE_SLAM_QUAKE = 1.8;

/**
 * Seconds a slam's shake takes to fade.
 */
export const BRUTE_QUAKE_FADE = 0.6;

/**
 * Stiffness of the spring on a brute's arms, loose enough that they lag
 * and swing with its steps.
 */
export const BRUTE_ARM_STIFFNESS = 28;

/**
 * Damping of the spring on a brute's arms.
 */
export const BRUTE_ARM_DAMPING = 5;

/**
 * The angle a brute's arms hang at.
 */
export const BRUTE_ARM_HANG = -1.3;

/**
 * Height of a brute's hips: it bends there, so leaning doesn't slide its
 * body off its legs.
 */
export const BRUTE_HIP = 0.32;
