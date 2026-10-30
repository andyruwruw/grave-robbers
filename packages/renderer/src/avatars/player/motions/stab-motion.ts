// Local Imports
import { easeIn, easeInOut, easeOut } from '../../../helpers/easing';
import { POSE_REST, STAB_POSE, STAB_REACH } from '../config/player-poses';
import { HANG_END, IMPACT_END, STRIKE_END } from '../config/player-timing';
import { WeaponMotion } from './weapon-motion';

// Types
import type { PlayerRig } from '../player-rig';
import type { MotionContext } from '../types/motion-context';

/**
 * A spear's stab: it drops level and draws back, then drives straight
 * ahead with a lunge as the blow lands, holds, and comes back upright.
 */
export class StabMotion extends WeaponMotion {
  /**
   * Poses the rig at a point in the swing.
   * @param rig The figure.
   * @param phase How far through the swing, 0 to 1 (1 and after is rest).
   * @param ctx The time, the combo, and the off-arm pose.
   */
  apply(rig: PlayerRig, phase: number, ctx: MotionContext): void {
    let level = 0;
    let reach = 0;
    if (phase < HANG_END) {
      level = easeOut(phase / HANG_END);
      reach = -level;
    } else if (phase < STRIKE_END) {
      level = 1;
      reach = -1 + 2 * easeIn((phase - HANG_END) / (STRIKE_END - HANG_END));
    } else if (phase < IMPACT_END) {
      level = 1;
      reach = 1;
    } else if (phase < 1) {
      const t = easeInOut((phase - IMPACT_END) / (1 - IMPACT_END));
      level = 1 - t;
      reach = 1 - t;
    }
    rig.tool.rotation.z = POSE_REST.shoulder + (STAB_POSE.shoulder - POSE_REST.shoulder) * level;
    rig.tool.rotation.x = 0;
    rig.tool.rotation.y = 0;
    rig.wrist.rotation.z = POSE_REST.wrist + (STAB_POSE.wrist - POSE_REST.wrist) * level;
    rig.grip.rotation.y = 0;
    rig.grip.rotation.x = 0;
    rig.tool.position.x = STAB_REACH * reach;
    ctx.poseOffhand(0);
    rig.head.rotation.z = 0;
    rig.body.rotation.z = -0.15 * Math.max(0, reach);
    rig.body.rotation.y = 0.25 * Math.min(0, reach);
    rig.body.position.x = 0.12 * Math.max(0, reach);
    rig.body.scale.set(1, 1, 1);
  }
}
