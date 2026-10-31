/**
 * Turned on the other monsters (Plague Knuckles), or risen on the
 * players' side (Grave Fists).
 */
export class Turned<P> {
  /**
   * Game-clock time it stops (a risen ally falls for good then).
   */
  until = 0;

  /**
   * The player it fights for, credited with its kills.
   */
  by: P | null = null;

  /**
   * Risen on the players' side: only other monsters can hurt it, and it
   * falls when its time is up.
   */
  ally = false;
}
