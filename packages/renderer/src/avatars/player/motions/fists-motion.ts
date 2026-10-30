// Packages
import { SUPER_COMBO } from '@halloween/shared/gear/melee-rules';

// Local Imports
import {
  FIST_GUARD,
  FIST_JAB,
  FIST_UPPER,
  FIST_WRIST,
} from '../config/player-poses';
import { HANG_END, IMPACT_END, STRIKE_END } from '../config/player-timing';
import { WeaponMotion } from './weapon-motion';

// Types
import type { PlayerRig } from '../player-rig';
import type { MotionContext } from '../types/motion-context';

/**
 * Spiked gauntlets on both fists, raised in a guard: a left jab, a right
 * punch, a left uppercut, and when charged a right super uppercut that
 * crouches and launches the player into the air.
 */
export class FistsMotion extends WeaponMotion {
  /**
   * Poses the rig at a point in the swing.
   * @param rig The figure.
   * @param phase How far through the swing, 0 to 1 (1 and after is rest).
   * @param ctx The time, the combo, and the off-arm pose.
   */
  apply(rig: PlayerRig, phase: number, ctx: MotionContext): void {
    const { combo } = ctx;
    const hit = phase < 1 ? Math.sin(Math.min(1, phase / STRIKE_END) * Math.PI / 2) * (phase < IMPACT_END ? 1 : 1 - (phase - IMPACT_END) / (1 - IMPACT_END)) : 0;
    let right = FIST_GUARD;
    let left = FIST_GUARD;
    let crouch = 0;
    let twist = 0;
    if (combo === 0) {
      left = FIST_GUARD + (FIST_JAB - FIST_GUARD) * hit;
      twist = -0.25 * hit;
    } else if (combo === 1) {
      right = FIST_GUARD + (FIST_JAB - FIST_GUARD) * hit;
      twist = 0.35 * hit;
    } else if (combo === 2) {
      left = FIST_GUARD + (FIST_UPPER - FIST_GUARD) * hit;
      twist = -0.2 * hit;
      crouch = 0.08 * (1 - hit);
    } else if (combo === SUPER_COMBO && phase < 1) {
      right = FIST_GUARD + (FIST_UPPER + 0.3 - FIST_GUARD) * hit;
      crouch = phase < HANG_END ? 0.15 * (phase / HANG_END) : 0;
      twist = 0.3 * hit;
    }
    rig.tool.rotation.z = right;
    rig.tool.rotation.x = 0;
    rig.tool.rotation.y = 0;
    rig.tool.position.x = 0;
    rig.wrist.rotation.z = FIST_WRIST;
    rig.grip.rotation.y = 0;
    rig.grip.rotation.x = 0;
    rig.lanternArm.rotation.z = left;
    rig.lanternArm.rotation.y = 0;
    rig.head.rotation.z = 0;
    rig.body.rotation.z = -0.1 * hit;
    rig.body.rotation.y = twist;
    rig.body.position.x = 0.05 * hit;
    rig.body.position.y -= crouch;
    rig.body.scale.set(1, 1, 1);
  }
}
