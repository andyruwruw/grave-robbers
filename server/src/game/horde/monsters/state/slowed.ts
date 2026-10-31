/**
 * Slowed by a hit (Phantom Edge's ecto slow, the Spirit Bow), apart from
 * a curse's slow. The strongest slow wins.
 */
export class Slowed {
  /**
   * What its speed is multiplied by.
   */
  factor = 1;

  /**
   * Game-clock time it wears off.
   */
  until = 0;
}
