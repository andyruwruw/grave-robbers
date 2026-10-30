// Types
import type { MapView } from '@halloween/shared/protocol/tv-tools';
import type { WorldMap } from '@halloween/shared/world/world-map';
import type { GroundItems } from './items/ground-items';
import type { StructureStore } from './structures/structure-store';
import type { TileTimers } from './terrain/tile-timers';
import type { WorldSite } from './types/site';
import type { WorldClock } from './world-clock';

/**
 * One part of the world. Parts hold the shared site and read through it
 * live, never keeping copies of its state.
 */
export abstract class WorldFeature {
  /**
   * Sets the part up on the world's shared state.
   * @param _site What every part of the world shares.
   */
  constructor(protected readonly _site: WorldSite) {}

  /**
   * The tiles.
   * @returns The site's map.
   */
  protected get map(): WorldMap {
    return this._site.map;
  }

  /**
   * The part of the map the TV frames.
   * @returns The site's view, or null for all of it.
   */
  protected get view(): MapView | null {
    return this._site.view;
  }

  /**
   * The world's game clock.
   * @returns The site's clock.
   */
  protected get clock(): WorldClock {
    return this._site.clock;
  }

  /**
   * Every built structure's state.
   * @returns The site's structure store.
   */
  protected get structures(): StructureStore {
    return this._site.structures;
  }

  /**
   * Everything lying on the ground.
   * @returns The site's ground items.
   */
  protected get items(): GroundItems {
    return this._site.items;
  }

  /**
   * Per-tile counters and timers.
   * @returns The site's tile timers.
   */
  protected get timers(): TileTimers {
    return this._site.timers;
  }
}
