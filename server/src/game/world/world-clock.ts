/**
 * The world's game clock, shared by every part of the world that reads or
 * stamps a time. The world is the only writer.
 */
export class WorldClock {
  /**
   * World seconds since the world began (saved).
   */
  now = 0;
}
