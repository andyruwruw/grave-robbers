/**
 * Pinned in place (The Impaler, Hunter's Arbalest): held still, and hurt
 * more by everyone but whoever pinned it.
 */
export class Pinned<P> {
  /**
   * Game-clock time it's let go.
   */
  until = 0;

  /**
   * Who pinned it (their hits get no bonus).
   */
  by: P | null = null;

  /**
   * What damage from anyone else is multiplied by while it's held.
   */
  bonus = 1;
}
