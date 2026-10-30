/**
 * A monster being shoved along: its velocity and until when.
 */
export class Knockback {
  /**
   * Velocity across (tiles/s).
   */
  x = 0;

  /**
   * Velocity down (tiles/s).
   */
  y = 0;

  /**
   * Game-clock time it ends.
   */
  until = 0;
}
