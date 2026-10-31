/**
 * A puddle a witch's potion left.
 */
export interface Puddle {
  /**
   * Stable id for the display.
   */
  id: number;

  /**
   * Where it is (tiles).
   */
  x: number;

  /**
   * Where it is (tiles).
   */
  y: number;

  /**
   * When it splashed (game clock).
   */
  at: number;

  /**
   * When it dries up (game clock).
   */
  until: number;

  /**
   * Whose it is for the kill feed.
   */
  by: string;

  /**
   * A bloater's bile rather than a witch's potion.
   */
  bile: boolean;
}
