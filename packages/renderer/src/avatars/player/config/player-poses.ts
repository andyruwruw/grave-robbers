// Types
import type { ArmPose } from '../types/arm-pose';

/**
 * The axe arm at rest: held upright in front. Each pose is the shoulder
 * angle (radians forward from hanging straight down) and the wrist angle
 * (the axe's tilt from the forearm).
 */
export const POSE_REST: ArmPose = { shoulder: 0.25, wrist: 1.9 };

/**
 * The axe arm raised: up and back with the axe hanging behind.
 */
export const POSE_RAISED: ArmPose = { shoulder: 3.5, wrist: 2 };

/**
 * The axe arm at impact: forward, the wrist snapping the axe out past
 * horizontal.
 */
export const POSE_IMPACT: ArmPose = { shoulder: 1, wrist: 0.35 };

/**
 * A scythe's sweep: the arm held out level with the handle pointing
 * forward and a little down.
 */
export const SWEEP_POSE: ArmPose = { shoulder: 1.35, wrist: 0.35 };

/**
 * How far (radians, of the arm's turn; the body adds a little) a sweep
 * winds out to one side: about 11 o'clock, centered on where they face.
 */
export const SWEEP_OUT = 0.48;

/**
 * How far a sweep whips across to the other side: about 1 o'clock.
 */
export const SWEEP_ACROSS = 0.48;

/**
 * The morning star's lash ends with the arm out level and the whip
 * pointing straight ahead.
 */
export const LASH_POSE: ArmPose = { shoulder: 1.45, wrist: 0.1 };

/**
 * How far back the morning star is pulled before the lash.
 */
export const LASH_BACK = -0.7;

/**
 * The quarterstaff held across the body.
 */
export const STAFF_POSE: ArmPose = { shoulder: 1.1, wrist: 1.3 };

/**
 * The off arm reaching in to hold the quarterstaff.
 */
export const STAFF_OFFHAND = 1.0;

/**
 * How far the off arm turns inward to hold the quarterstaff.
 */
export const STAFF_REACH = 0.7;

/**
 * The gauntlets' guard (shoulder angle).
 */
export const FIST_GUARD = 0.9;

/**
 * The gauntlets' jab (shoulder angle).
 */
export const FIST_JAB = 1.6;

/**
 * The gauntlets' uppercut (shoulder angle).
 */
export const FIST_UPPER = 2.6;

/**
 * The gauntlets' wrist angle.
 */
export const FIST_WRIST = 0.3;

/**
 * A crossbow reloading: tipped muzzle-down.
 */
export const RELOAD_POSE: ArmPose = { shoulder: 0.55, wrist: 1.1 };

/**
 * The free arm cranking a reloading crossbow.
 */
export const RELOAD_ARM = 1.2;

/**
 * How far the body leans into the stock while taking aim.
 */
export const AIM_LEAN = 0.08;

/**
 * A spear's stab: the arm level with the spear pointing straight ahead.
 */
export const STAB_POSE: ArmPose = { shoulder: 1.5, wrist: 0.05 };

/**
 * How far the hand draws back and drives forward in a stab.
 */
export const STAB_REACH = 0.22;

/**
 * Digging a grave: the spade lifted in front.
 */
export const DIG_LIFT: ArmPose = { shoulder: 1.4, wrist: -0.75 };

/**
 * Digging: the spade driven down into the ground.
 */
export const DIG_STAB: ArmPose = { shoulder: 0.8, wrist: -0.3 };

/**
 * Digging: the spade heaved up over the shoulder to toss the dirt.
 */
export const DIG_TOSS: ArmPose = { shoulder: 2.6, wrist: 1.5 };

/**
 * Guns (the crossbow and the blunderbuss) are held level in front instead.
 */
export const POSE_AIM: ArmPose = { shoulder: 1.45, wrist: 0.12 };

/**
 * How far a gun kicks up when it fires.
 */
export const SHOT_KICK = 0.55;

/**
 * Off-hand arm angle raised high with a torch.
 */
export const ARM_TORCH = 2.2;

/**
 * Off-hand arm angle with the forearm forward behind a shield.
 */
export const ARM_SHIELD = 1.15;

/**
 * The shield arm raised to block (forward). Past halfway up, the shield
 * leaves the arm and stands square in front of the body.
 */
export const ARM_BLOCK = 1.45;

/**
 * How far the shield arm swings in across the chest to block.
 */
export const ARM_BLOCK_YAW = 0.75;

/**
 * How far the torso tips forward at full speed (radians, from the hips).
 */
export const RUN_LEAN = 0.38;

/**
 * How far the torso tips sideways when moving across the facing.
 */
export const SIDE_LEAN = 0.22;

/**
 * How high the hips sit.
 */
export const HIP_HEIGHT = 0.25;

/**
 * How hard the arms pump while running.
 */
export const ARM_PUMP = 0.55;
