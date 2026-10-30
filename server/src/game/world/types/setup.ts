// Types
import type { MapView } from '@halloween/shared/protocol/tv-tools';
import type { WorldMap } from '@halloween/shared/world/world-map';
import type { WorldSave } from '../../storage/types/save';

/**
 * A map opened for a new world: from a save, a preset, or the generator.
 */
export interface OpenedMap {
  /**
   * The world's seed.
   */
  seed: number;

  /**
   * The tiles.
   */
  map: WorldMap;

  /**
   * The world clock to start from (seconds).
   */
  time: number;

  /**
   * The part of the map the TV frames, or null for all of it.
   */
  view: MapView | null;

  /**
   * Started from a test map (the sandbox): natural spawning starts off.
   */
  quiet: boolean;

  /**
   * The map editor's Mix setting last painted on each tile, by index.
   */
  blends: Map<number, string>;

  /**
   * The save it was loaded from, or null when it started fresh.
   */
  save: WorldSave | null;
}
