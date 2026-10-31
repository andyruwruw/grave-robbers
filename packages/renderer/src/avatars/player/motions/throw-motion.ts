// Local Imports
import { easeIn, easeInOut, easeOut } from '../../../helpers/easing';
import {
  POSE_REST,
  THROW_BACK,
  THROW_OUT,
  THROW_TWIST,
} from '../config/player-poses';
import { HANG_END, IMPACT_END, STRIKE_END } from '../config/player-timing';
import { WeaponMotion } from './weapon-motion';

// Types
import type { PlayerRig } from '../player-rig';
import type { ArmPose } from '../types/arm-pose';
import type { MotionContext } from '../types/motion-context';

/**
 * The Soulbound and Wraith Glaive's throw (their stab step): the blade
 * laid flat and drawn back behind the shoulder with the body twisted
 * away, then flung out level ahead as the body whips through, held a
 * moment at the release, and the empty arm comes back (the glaive itself
 * is hidden while it's out, see `PlayerState.thrown`).
 */
export class ThrowMotion extends WeaponMotion {
  /**
   * Poses the rig at a point in the throw.
   * @param rig The figure.
   * @param phase How far through the swing, 0 to 1 (1 and after is rest).
   * @param ctx The time, the combo, and the off-arm pose.
   */
  apply(rig: PlayerRig, phase: number, ctx: MotionContext): void {
    let from: ArmPose = POSE_REST;
    let to: ArmPose = POSE_REST;
    let k = 0;
    let twist = 0;
    let flat = 0;
    if (phase < HANG_END) {
      k = easeOut(phase / HANG_END);
      to = THROW_BACK;
      twist = THROW_TWIST * k;
      flat = k;
    } else if (phase < STRIKE_END) {
      const t = easeIn((phase - HANG_END) / (STRIKE_END - HANG_END));
      from = THROW_BACK;
      to = THROW_OUT;
      k = t;
      twist = THROW_TWIST * (1 - 1.75 * t);
      flat = 1;
    } else if (phase < IMPACT_END) {
      from = THROW_OUT;
      to = THROW_OUT;
      twist = -THROW_TWIST * 0.75;
      flat = 1;
    } else if (phase < 1) {
      const t = easeInOut((phase - IMPACT_END) / (1 - IMPACT_END));
      from = THROW_OUT;
      k = t;
      twist = -THROW_TWIST * 0.75 * (1 - t);
      flat = 1 - t;
    }
    const lunge = phase >= STRIKE_END && phase < 1 ? 1 - Math.max(0, (phase - IMPACT_END) / (1 - IMPACT_END)) : 0;
    rig.tool.rotation.z = from.shoulder + (to.shoulder - from.shoulder) * k;
    rig.tool.rotation.x = 0;
    rig.tool.rotation.y = twist * 0.5;
    rig.wrist.rotation.z = from.wrist + (to.wrist - from.wrist) * k;
    rig.grip.rotation.y = -(Math.PI / 2) * flat;
    rig.grip.rotation.x = 0;
    rig.tool.position.x = 0.12 * lunge;
    ctx.poseOffhand(-0.2 * twist);
    rig.head.rotation.z = 0;
    rig.body.rotation.z = -0.12 * lunge;
    rig.body.rotation.y = twist;
    rig.body.position.x = 0.1 * lunge;
    rig.body.scale.set(1, 1, 1);
  }
}
