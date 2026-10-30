/**
 * Health numbers for the Overview tab, refreshed about once a second.
 */
export interface StatsSnapshot {
  /**
   * Server ticks in the last second.
   */
  tps: number;

  /**
   * Average ms one server tick took.
   */
  stepMs: number;

  /**
   * The hidden world level.
   */
  worldLevel: number;

  /**
   * Each player's hidden level, by id.
   */
  levels: Record<string, number>;

  /**
   * The TV's frame rate, or null where there's no renderer (the admin
   * page).
   */
  fps: number | null;

  /**
   * How much each screen is sent per second (KB, before compression).
   */
  displayKBps: number;

  /**
   * This page's own ping (ms), once measured.
   */
  ping: number | null;

  /**
   * Monsters on the map.
   */
  monsters: number;

  /**
   * Items lying on the ground.
   */
  items: number;

  /**
   * Whether a blood moon is up.
   */
  bloodMoon: boolean;
}
