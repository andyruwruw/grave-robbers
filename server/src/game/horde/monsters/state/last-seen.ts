/**
 * Where a monster last saw (or was hit by) someone, and when.
 */
export class LastSeen {
  /**
   * Where (tiles).
   */
  x: number;

  /**
   * Where (tiles).
   */
  y: number;

  /**
   * Game-clock time, or -Infinity once forgotten.
   */
  at = -Infinity;

  /**
   * Starts out on the monster's own spot, forgotten.
   * @param x Where it appeared.
   * @param y Where it appeared.
   */
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  /**
   * Notes a sighting.
   * @param x Where.
   * @param y Where.
   * @param at When.
   */
  see(x: number, y: number, at: number): void {
    this.x = x;
    this.y = y;
    this.at = at;
  }
}
