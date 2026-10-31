// Types
import type { MapGenSettings } from '@halloween/shared/map-gen/settings';
import type { WorldMap } from '@halloween/shared/world/world-map';
import type { Point, Rect } from './types/geometry';

/**
 * What every generation pass on one map shares: the map being drawn, its
 * seeded PRNG, the generator knobs, the rectangles already claimed, and
 * the point landmarks turn their doors toward.
 */
export class GenCanvas {
  /**
   * Rectangles already claimed (the crypt, each landmark), which terraces
   * and later landmarks stay off.
   */
  readonly reserved: Rect[] = [];

  /**
   * Where landmarks face their doors: the map's middle on a classic map,
   * each site's middle while a huge world builds it.
   */
  center: Point;

  /**
   * Starts a canvas.
   * @param map The map being drawn.
   * @param rand The seeded PRNG; every pass draws from it in turn.
   * @param gen The generator knobs.
   */
  constructor(readonly map: WorldMap, readonly rand: () => number, readonly gen: MapGenSettings) {
    this.center = [map.width / 2, map.height / 2];
  }
}
