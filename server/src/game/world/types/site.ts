// Types
import type { MapView } from '@halloween/shared/protocol/tv-tools';
import type { WorldMap } from '@halloween/shared/world/world-map';
import type { GroundItems } from '../items/ground-items';
import type { StructureStore } from '../structures/structure-store';
import type { TileTimers } from '../terrain/tile-timers';
import type { WorldClock } from '../world-clock';

/**
 * The world's shared state that every world feature reads and changes.
 * None of it is ever replaced while the world lives.
 */
export interface WorldSite {
  /**
   * The tiles.
   */
  readonly map: WorldMap;

  /**
   * The part of the map the TV frames, or null for all of it.
   */
  readonly view: MapView | null;

  /**
   * The world's game clock.
   */
  readonly clock: WorldClock;

  /**
   * Every built structure's state.
   */
  readonly structures: StructureStore;

  /**
   * Everything lying on the ground.
   */
  readonly items: GroundItems;

  /**
   * Per-tile counters and timers for gathering, digging, robbing, and
   * regrowth.
   */
  readonly timers: TileTimers;
}
