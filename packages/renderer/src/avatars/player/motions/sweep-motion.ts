// Local Imports
import { easeInOut, easeOut } from '../../../helpers/easing';
import {
  POSE_REST,
  SWEEP_ACROSS,
  SWEEP_OUT,
  SWEEP_POSE,
} from '../config/player-poses';
import { HANG_END, IMPACT_END } from '../config/player-timing';
import { WeaponMotion } from './weapon-motion';

// Types
import type { PlayerRig } from '../player-rig';
import type { MotionContext } from '../types/motion-context';

/**
 * A scythe's sweep: the blade turns flat and swings out to one side,
 * then the body and arm whip it level across to the other, centered on
 * where they face (passing dead ahead as the blow lands), and it settles
 * back upright.
 */
export class SweepMotion extends WeaponMotion {
  /**
   * Poses the rig at a point in the swing.
   * @param rig The figure.
   * @param phase How far through the swing, 0 to 1 (1 and after is rest).
   * @param ctx The time, the combo, and the off-arm pose.
   */
  apply(rig: PlayerRig, phase: number, ctx: MotionContext): void {
    let out = 0;
    let across = 0;
    let flat = 0;
    if (phase < HANG_END) {
      out = easeOut(phase / HANG_END);
      flat = out;
    } else if (phase < IMPACT_END) {
      const t = easeInOut(Math.min(1, (phase - HANG_END) / (IMPACT_END - HANG_END)));
      out = 1 - t;
      across = t;
      flat = 1;
    } else if (phase < 1) {
      const t = easeInOut((phase - IMPACT_END) / (1 - IMPACT_END));
      across = 1 - t;
      flat = 1 - t;
    }
    const yaw = SWEEP_OUT * out - SWEEP_ACROSS * across;
    rig.tool.rotation.z = POSE_REST.shoulder + (SWEEP_POSE.shoulder - POSE_REST.shoulder) * flat;
    rig.tool.rotation.x = 0;
    rig.tool.rotation.y = yaw * 0.6;
    rig.wrist.rotation.z = POSE_REST.wrist + (SWEEP_POSE.wrist - POSE_REST.wrist) * flat;
    rig.grip.rotation.y = -(Math.PI / 2) * flat;
    rig.tool.position.x = 0;
    rig.grip.rotation.x = 0;
    ctx.poseOffhand(0);
    rig.head.rotation.z = 0;
    rig.body.rotation.z = 0;
    rig.body.rotation.y = yaw * 0.5;
    rig.body.position.x = 0.1 * across * (1 - across) * 4;
    rig.body.scale.set(1, 1, 1);
  }
}
