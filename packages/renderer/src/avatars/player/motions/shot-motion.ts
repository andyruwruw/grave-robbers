// Local Imports
import { POSE_AIM, SHOT_KICK } from '../config/player-poses';
import { WeaponMotion } from './weapon-motion';

// Types
import type { PlayerRig } from '../player-rig';
import type { MotionContext } from '../types/motion-context';

/**
 * Firing a gun: it kicks up and the body rocks back, then settles
 * level again.
 */
export class ShotMotion extends WeaponMotion {
  /**
   * Poses the rig at a point in the swing.
   * @param rig The figure.
   * @param phase How far through the swing, 0 to 1 (1 and after is rest).
   * @param ctx The time, the combo, and the off-arm pose.
   */
  apply(rig: PlayerRig, phase: number, ctx: MotionContext): void {
    const kick = phase < 1 ? Math.sin(Math.min(1, phase * 4) * Math.PI / 2) * (1 - phase) * (1 - phase) : 0;
    rig.tool.rotation.z = POSE_AIM.shoulder + kick * SHOT_KICK;
    rig.tool.rotation.x = 0;
    rig.tool.rotation.y = 0;
    rig.grip.rotation.y = 0;
    rig.tool.position.x = 0;
    rig.grip.rotation.x = 0;
    rig.wrist.rotation.z = POSE_AIM.wrist + kick * 0.3;
    ctx.poseOffhand(0.15 * kick);
    rig.head.rotation.z = 0.1 * kick;
    rig.body.rotation.z = -0.15 * kick;
    rig.body.rotation.y = 0;
    rig.body.position.x = -0.05 * kick;
    rig.body.scale.set(1, 1, 1);
  }
}
