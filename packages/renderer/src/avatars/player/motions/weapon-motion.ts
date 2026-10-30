// Types
import type { PlayerRig } from '../player-rig';
import type { MotionContext } from '../types/motion-context';

/**
 * How the rig moves through one swing of a kind of weapon. Stateless: one
 * shared instance per kind, with everything per avatar passed in.
 */
export abstract class WeaponMotion {
  /**
   * Poses the rig at a point in the swing.
   * @param rig The figure.
   * @param phase How far through the swing, 0 to 1 (1 and after is rest).
   * @param ctx The time, the combo, and the off-arm pose.
   */
  abstract apply(rig: PlayerRig, phase: number, ctx: MotionContext): void;
}
