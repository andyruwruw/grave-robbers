// Local Imports
import { STAFF_OFFHAND, STAFF_POSE, STAFF_REACH, STAFF_SWEEP } from '../config/player-poses';
import { IMPACT_END, STRIKE_END } from '../config/player-timing';
import { WeaponMotion } from './weapon-motion';

// Types
import type { PlayerRig } from '../player-rig';
import type { MotionContext } from '../types/motion-context';

/**
 * The quarterstaff, held across the body in both hands: the first hit
 * swings the top end down and sweeps it from one side across to the
 * other (`STAFF_SWEEP`), the second whips the bottom end up sweeping back
 * the other way, the third
 * lets go with the off hand and twirls it all the way round.
 */
export class StaffMotion extends WeaponMotion {
  /**
   * Poses the rig at a point in the swing.
   * @param rig The figure.
   * @param phase How far through the swing, 0 to 1 (1 and after is rest).
   * @param ctx The time, the combo, and the off-arm pose.
   */
  apply(rig: PlayerRig, phase: number, ctx: MotionContext): void {
    const { combo, time } = ctx;
    const swing = phase < 1 ? Math.sin(Math.min(1, phase / STRIKE_END) * Math.PI / 2) * (phase < IMPACT_END ? 1 : 1 - (phase - IMPACT_END) / (1 - IMPACT_END)) : 0;
    let shoulder = STAFF_POSE.shoulder;
    let wrist = STAFF_POSE.wrist;
    let twirl = 0;
    let offhand = STAFF_OFFHAND;
    const fade = phase < IMPACT_END ? 1 : phase < 1 ? 1 - (phase - IMPACT_END) / (1 - IMPACT_END) : 0;
    let yaw = STAFF_SWEEP * Math.sin(Math.min(1, phase / STRIKE_END) * Math.PI * 2) * fade;
    if (combo === 0) {
      shoulder += 0.9 - 1.8 * swing;
      wrist -= 0.8 * swing;
    } else if (combo === 1) {
      shoulder -= 0.4 - 1.6 * swing;
      wrist += 1 * swing;
      yaw = -yaw;
    } else if (combo === 2 && phase < 1) {
      twirl = Math.min(1, phase / IMPACT_END) * Math.PI * 2;
      shoulder = 1.45;
      offhand = 0.3;
      yaw = 0;
    } else {
      yaw = 0;
    }
    rig.tool.rotation.z = shoulder;
    rig.tool.rotation.x = 0;
    rig.tool.rotation.y = yaw * 0.6;
    rig.tool.position.x = 0;
    rig.wrist.rotation.z = wrist;
    rig.grip.rotation.y = 0;
    rig.grip.rotation.x = twirl;
    rig.lanternArm.rotation.z = offhand + (combo === 0 ? 0.6 - swing : combo === 1 ? swing * 0.8 : 0) + Math.sin(time * 2) * 0.02;
    rig.lanternArm.rotation.y = STAFF_REACH;
    rig.head.rotation.z = 0;
    rig.body.rotation.z = -0.15 * swing;
    rig.body.rotation.y = yaw * 0.5;
    rig.body.position.x = 0.06 * swing;
    rig.body.scale.set(1, 1, 1);
  }
}
