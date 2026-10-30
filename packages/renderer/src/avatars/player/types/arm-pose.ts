/**
 * A key pose of the arm holding something.
 */
export interface ArmPose {
  /**
   * Shoulder angle, radians forward from hanging straight down.
   */
  shoulder: number;

  /**
   * Wrist angle: what's in hand's tilt from the forearm.
   */
  wrist: number;
}
