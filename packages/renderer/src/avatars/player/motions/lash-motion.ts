// Local Imports
import { easeInOut, easeOut } from '../../../helpers/easing';
import { LASH_BACK, LASH_POSE, POSE_REST } from '../config/player-poses';
import { HANG_END, IMPACT_END, STRIKE_END } from '../config/player-timing';
import { WeaponMotion } from './weapon-motion';

// Types
import type { PlayerRig } from '../player-rig';
import type { MotionContext } from '../types/motion-context';

/**
 * The morning star's lash: the whole whip is pulled back low behind,
 * then the arm swings it up over the head and down in front as it
 * cracks out straight, holds, and drops back to hanging.
 */
export class LashMotion extends WeaponMotion {
  /**
   * Poses the rig at a point in the swing.
   * @param rig The figure.
   * @param phase How far through the swing, 0 to 1 (1 and after is rest).
   * @param ctx The time, the combo, and the off-arm pose.
   */
  apply(rig: PlayerRig, phase: number, ctx: MotionContext): void {
    let shoulder = POSE_REST.shoulder;
    let lean = 0;
    if (phase < HANG_END) {
      const t = easeOut(phase / HANG_END);
      shoulder = POSE_REST.shoulder + (LASH_BACK - POSE_REST.shoulder) * t;
      lean = 0.25 * t;
    } else if (phase < STRIKE_END) {
      const t = easeInOut((phase - HANG_END) / (STRIKE_END - HANG_END));
      shoulder = LASH_BACK + (LASH_POSE.shoulder - Math.PI * 2 - LASH_BACK) * t;
      lean = 0.25 - 0.5 * t;
    } else if (phase < IMPACT_END) {
      shoulder = LASH_POSE.shoulder;
      lean = -0.25;
    } else if (phase < 1) {
      const t = easeInOut((phase - IMPACT_END) / (1 - IMPACT_END));
      shoulder = LASH_POSE.shoulder + (POSE_REST.shoulder - LASH_POSE.shoulder) * t;
      lean = -0.25 * (1 - t);
    }
    rig.tool.rotation.z = shoulder;
    rig.tool.rotation.x = 0;
    rig.tool.rotation.y = 0;
    rig.tool.position.x = 0;
    rig.wrist.rotation.z = LASH_POSE.wrist;
    rig.grip.rotation.y = 0;
    rig.grip.rotation.x = 0;
    ctx.poseOffhand(lean);
    rig.head.rotation.z = 0.3 * lean;
    rig.body.rotation.z = -lean;
    rig.body.rotation.y = lean;
    rig.body.position.x = 0;
    rig.body.scale.set(1, 1, 1);
  }
}
