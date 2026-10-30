/**
 * A bleeding wound: damage a second, until when, and who made it.
 */
export class Bleeding<P> {
  /**
   * Damage a second.
   */
  rate = 0;

  /**
   * Game-clock time it stops.
   */
  until = 0;

  /**
   * Who made it, credited with a bleed kill.
   */
  by: P | null = null;
}
