// Types
import type { RegrowthTile } from '@halloween/shared/world/regrowth';
import type { WorldEventKind } from '@halloween/shared/world-events/types/world-events';

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
   * The world events that are up.
   */
  worldEvents: WorldEventKind[];

  /**
   * How many of each regrowing tile the map has now.
   */
  stocked: Record<RegrowthTile, number>;
}

/**
 * What the TPS, FPS, and server ticks overlay reads once a second.
 */
export interface PerfSample {
  /**
   * Server ticks in the last second, or null before the first snapshot.
   */
  tps: number | null;

  /**
   * Average ms one server tick took, or null before the first snapshot.
   */
  stepMs: number | null;

  /**
   * This screen's frame rate, or null without a renderer.
   */
  fps: number | null;
}
