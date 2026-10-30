// Local Imports
import { easeIn, easeInOut, easeOut } from '../../../helpers/easing';
import { POSE_IMPACT, POSE_RAISED, POSE_REST } from '../config/player-poses';
import {
  HANG_END,
  IMPACT_END,
  STRIKE_END,
  WINDUP_END,
} from '../config/player-timing';
import { WeaponMotion } from './weapon-motion';

// Types
import type { PlayerRig } from '../player-rig';
import type { ArmPose } from '../types/arm-pose';
import type { MotionContext } from '../types/motion-context';

/**
 * The strike, in five beats: wind-up (axe hauled far back over the
 * shoulder, leaning back, twisting away, rising onto the toes), a hang at
 * the top with a tremble, a violent whip down past horizontal with a lunge,
 * a deep crouch, and a squash; a held beat at impact; then an eased
 * recovery to rest.
 */
export class AxeSwingMotion extends WeaponMotion {
  /**
   * Poses the rig at a point in the swing.
   * @param rig The figure.
   * @param phase How far through the swing, 0 to 1 (1 and after is rest).
   * @param ctx The time, the combo, and the off-arm pose.
   */
  apply(rig: PlayerRig, phase: number, ctx: MotionContext): void {
    const { time } = ctx;
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
    let strike = 0;
    let lean = 0;
    let twist = 0;
    let step = 0;
    let rise = 0;
    let squash = 0;
    if (phase < WINDUP_END) {
      const t = easeOut(phase / WINDUP_END);
      arm = mix(POSE_REST, POSE_RAISED, t);
      lean = 0.22 * t;
      twist = 0.5 * t;
      rise = 0.04 * t;
    } else if (phase < HANG_END) {
      arm = { shoulder: POSE_RAISED.shoulder + Math.sin(time * 90) * 0.04, wrist: POSE_RAISED.wrist };
      lean = 0.22;
      twist = 0.5;
      rise = 0.04;
    } else if (phase < STRIKE_END) {
      const t = easeIn((phase - HANG_END) / (STRIKE_END - HANG_END));
      arm = { shoulder: POSE_RAISED.shoulder + (POSE_IMPACT.shoulder - POSE_RAISED.shoulder) * t, wrist: POSE_RAISED.wrist + (POSE_IMPACT.wrist - POSE_RAISED.wrist) * t * t };
      strike = t;
      lean = 0.22 - 0.72 * t;
      twist = 0.5 - 1.05 * t;
      step = 0.18 * t;
      rise = 0.04 - 0.12 * t;
      squash = t;
    } else if (phase < IMPACT_END) {
      arm = POSE_IMPACT;
      strike = 1;
      lean = -0.5;
      twist = -0.55;
      step = 0.18;
      rise = -0.08;
      squash = 1 - (phase - STRIKE_END) / (IMPACT_END - STRIKE_END) * 0.5;
    } else if (phase < 1) {
      const t = easeInOut((phase - IMPACT_END) / (1 - IMPACT_END));
      arm = mix(POSE_IMPACT, POSE_REST, t);
      strike = 1 - t;
      lean = -0.5 * (1 - t);
      twist = -0.55 * (1 - t);
      step = 0.18 * (1 - t);
      rise = -0.08 * (1 - t);
      squash = 0.5 * (1 - t);
    }
    rig.tool.rotation.z = arm.shoulder;
    rig.tool.rotation.x = -0.3 * strike;
    rig.wrist.rotation.z = arm.wrist;
    rig.tool.rotation.y = 0;
    rig.grip.rotation.y = 0;
    rig.tool.position.x = 0;
    rig.grip.rotation.x = 0;
    ctx.poseOffhand(lean);
    rig.head.rotation.z = lean * 0.4;
    rig.body.rotation.z = -lean;
    rig.body.rotation.y = twist;
    rig.body.position.x = step;
    rig.body.position.y += rise;
    rig.body.scale.set(1 + squash * 0.08, 1 - squash * 0.1, 1 + squash * 0.08);
  }
}
