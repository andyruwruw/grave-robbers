/**
 * What a weapon motion needs besides the rig. One object per avatar,
 * refilled each frame (never allocated per frame).
 */
export interface MotionContext {
  /**
   * Seconds since the renderer started.
   */
  time: number;

  /**
   * Which hit of a combo this swing is.
   */
  combo: number;

  /**
   * Seconds since the last swing (or shot, or spray pulse) began.
   */
  swingAge: number;

  /**
   * Poses the off arm (lantern, torch, or shield) for a body lean.
   * @param lean How far the body leans with the swing.
   */
  poseOffhand: (lean: number) => void;
}
