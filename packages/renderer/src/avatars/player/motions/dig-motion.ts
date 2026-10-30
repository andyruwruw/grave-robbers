// Local Imports
import { easeIn, easeInOut, easeOut } from '../../../helpers/easing';
import {
  DIG_LIFT,
  DIG_STAB,
  DIG_TOSS,
  POSE_REST,
} from '../config/player-poses';
import { HANG_END, IMPACT_END, STRIKE_END } from '../config/player-timing';
import { WeaponMotion } from './weapon-motion';

// Types
import type { PlayerRig } from '../player-rig';
import type { ArmPose } from '../types/arm-pose';
import type { MotionContext } from '../types/motion-context';

/**
 * Digging: the spade comes up in front (leaning back a little), is
 * driven down into the ground with a crouch as the blow lands, then is
 * heaved up and back over the shoulder with a twist, tossing the dirt,
 * and settles.
 */
export class DigMotion extends WeaponMotion {
  /**
   * Poses the rig at a point in the swing.
   * @param rig The figure.
   * @param phase How far through the swing, 0 to 1 (1 and after is rest).
   * @param ctx The time, the combo, and the off-arm pose.
   */
  apply(rig: PlayerRig, phase: number, ctx: MotionContext): void {
    /**
     * Blends two arm poses.
     * @param a The pose at 0.
     * @param b The pose at 1.
     * @param t How far toward `b`.
     * @returns The blended pose.
     */
    const mix = (a: ArmPose, b: ArmPose, t: number): ArmPose => ({
      shoulder: a.shoulder + (b.shoulder - a.shoulder) * t,
      wrist: a.wrist + (b.wrist - a.wrist) * t,
    });
    let arm = POSE_REST;
    let lean = 0;
    let twist = 0;
    let squash = 0;
    if (phase < HANG_END) {
      const t = easeOut(phase / HANG_END);
      arm = mix(POSE_REST, DIG_LIFT, t);
      lean = 0.15 * t;
    } else if (phase < STRIKE_END) {
      const t = easeIn((phase - HANG_END) / (STRIKE_END - HANG_END));
      arm = mix(DIG_LIFT, DIG_STAB, t);
      lean = 0.15 - 0.5 * t;
      squash = t;
    } else if (phase < IMPACT_END) {
      arm = DIG_STAB;
      lean = -0.35;
      squash = 1;
    } else if (phase < 0.85) {
      const t = easeOut((phase - IMPACT_END) / (0.85 - IMPACT_END));
      arm = mix(DIG_STAB, DIG_TOSS, t);
      lean = -0.35 + 0.55 * t;
      twist = 0.7 * t;
      squash = 1 - t;
    } else if (phase < 1) {
      const t = easeInOut((phase - 0.85) / 0.15);
      arm = mix(DIG_TOSS, POSE_REST, t);
      lean = 0.2 * (1 - t);
      twist = 0.7 * (1 - t);
    }
    rig.tool.rotation.z = arm.shoulder;
    rig.tool.rotation.x = 0;
    rig.tool.rotation.y = 0;
    rig.wrist.rotation.z = arm.wrist;
    rig.grip.rotation.y = 0;
    rig.grip.rotation.x = 0;
    rig.tool.position.x = 0;
    ctx.poseOffhand(lean);
    rig.head.rotation.z = lean * 0.4;
    rig.body.rotation.z = -lean;
    rig.body.rotation.y = twist;
    rig.body.position.x = 0.08 * squash;
    rig.body.position.y -= 0.06 * squash;
    rig.body.scale.set(1 + squash * 0.06, 1 - squash * 0.08, 1 + squash * 0.06);
  }
}
