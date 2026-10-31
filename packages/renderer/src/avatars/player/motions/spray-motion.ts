// Local Imports
import { POSE_AIM, SPRAY_SHAKE, SPRAY_SWEEP } from '../config/player-poses';
import { SPRAY_EASE, SPRAY_HOLD } from '../config/player-timing';
import { WeaponMotion } from './weapon-motion';

// Types
import type { PlayerRig } from '../player-rig';
import type { MotionContext } from '../types/motion-context';

/**
 * The Hellmouth's spray, held as long as its pulses keep coming: the gun
 * level and low, the body braced back against the gout, the arm shaking
 * and sweeping the cone gently side to side; it settles back to the aim
 * once the pulses stop. Reads how long since the last pulse
 * (`ctx.swingAge`) rather than `phase`.
 */
export class SprayMotion extends WeaponMotion {
  /**
   * Poses the rig while spraying, or easing back to the aim.
   * @param rig The figure.
   * @param _phase Unused (the spray goes by `ctx.swingAge`).
   * @param ctx The time, the time since the last pulse, and the off-arm pose.
   */
  apply(rig: PlayerRig, _phase: number, ctx: MotionContext): void {
    const k = ctx.swingAge < SPRAY_HOLD ? 1 : Math.max(0, 1 - (ctx.swingAge - SPRAY_HOLD) / SPRAY_EASE);
    const shake = Math.sin(ctx.time * 47) * SPRAY_SHAKE * k;
    const sweep = Math.sin(ctx.time * 4.5) * SPRAY_SWEEP * k;
    rig.tool.rotation.z = POSE_AIM.shoulder - 0.08 * k + shake;
    rig.tool.rotation.x = 0;
    rig.tool.rotation.y = sweep;
    rig.wrist.rotation.z = POSE_AIM.wrist + shake * 0.6;
    rig.grip.rotation.y = 0;
    rig.grip.rotation.x = 0;
    rig.tool.position.x = 0.04 * k;
    ctx.poseOffhand(0.12 * k);
    rig.head.rotation.z = 0.06 * k;
    rig.body.rotation.z = -0.1 * k;
    rig.body.rotation.y = sweep * 0.4;
    rig.body.position.x = -0.04 * k;
    rig.body.scale.set(1, 1, 1);
  }
}
