// Types
import type { MapGenSettings } from '@halloween/shared/map-gen/settings';
import type { WorldMap } from '@halloween/shared/world/world-map';
import type { Rect } from './types/geometry';

/**
 * What every generation pass on one map shares: the map being drawn, its
 * seeded PRNG, the generator knobs, and the rectangles already claimed.
 */
export class GenCanvas {
  /**
   * Rectangles already claimed (the crypt, each landmark), which terraces
   * stay off. Classic maps only.
   */
  readonly reserved: Rect[] = [];

  /**
   * Starts a canvas.
   * @param map The map being drawn.
   * @param rand The seeded PRNG; every pass draws from it in turn.
   * @param gen The generator knobs.
   */
  constructor(readonly map: WorldMap, readonly rand: () => number, readonly gen: MapGenSettings) {}
}
