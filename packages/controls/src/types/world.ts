// Types
import type { MapView } from '@halloween/shared/protocol/tv-tools';

/**
 * The last world the server sent, kept to hand a renderer that mounts
 * later.
 */
export interface WorldSnapshot {
  /**
   * The world's seed.
   */
  seed: number;

  /**
   * The map's width in tiles.
   */
  width: number;

  /**
   * The encoded tiles.
   */
  tiles: string;

  /**
   * The encoded terrain levels.
   */
  levels: string;

  /**
   * The encoded stair directions.
   */
  ramps: string;

  /**
   * The part of a huge map this screen was sent, or null for all of it.
   */
  view: MapView | null;
}
