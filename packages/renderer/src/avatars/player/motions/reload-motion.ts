// Local Imports
import { RELOAD_ARM, RELOAD_POSE } from '../config/player-poses';
import { RELOAD_CRANK, RELOAD_EASE } from '../config/player-timing';

// Types
import type { PlayerRig } from '../player-rig';

/**
 * A crossbow reloading: it tips down, muzzle to the ground, and the free
 * hand works the crank in circles until it's spanned again, easing in
 * over RELOAD_EASE. Added on top of the aiming pose. Stateless.
 */
export class ReloadMotion {
  /**
   * Blends the reload into the rig's current pose.
   * @param rig The figure.
   * @param age Seconds since the reload began.
   */
  apply(rig: PlayerRig, age: number): void {
    const w = Math.min(1, age / RELOAD_EASE);
    rig.tool.rotation.z += (RELOAD_POSE.shoulder - rig.tool.rotation.z) * w;
    rig.wrist.rotation.z += (RELOAD_POSE.wrist - rig.wrist.rotation.z) * w;
    rig.lanternArm.rotation.z += (RELOAD_ARM + Math.sin(age * RELOAD_CRANK) * 0.35 - rig.lanternArm.rotation.z) * w;
    rig.lanternArm.rotation.x = Math.cos(age * RELOAD_CRANK) * 0.25 * w;
  }
}
