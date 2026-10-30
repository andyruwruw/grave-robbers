/**
 * Server health for the TV's Overview tab, averaged over the last second.
 */
export interface ServerStats {
  /**
   * Ticks actually run per second (TICK_RATE when keeping up).
   */
  tps: number;

  /**
   * Average simulation time per tick, in ms.
   */
  stepMs: number;

  /**
   * The hidden world level and each player's level, by player id.
   */
  worldLevel: number;

  /**
   * Each player's hidden level, by player id.
   */
  levels: Record<string, number>;

  /**
   * How much each display is sent per second (state and tile changes),
   * in KB before compression.
   */
  displayKBps: number;
}
