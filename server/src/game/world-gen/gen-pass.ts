// Types
import type { MapGenSettings } from '@halloween/shared/map-gen/settings';
import type { WorldMap } from '@halloween/shared/world/world-map';
import type { GenCanvas } from './gen-canvas';

/**
 * One generation step over a shared canvas. Steps hold the canvas, never
 * copies of what's on it, so they all draw on the same map and PRNG.
 */
export abstract class GenPass {
  /**
   * Sets the pass up on a canvas.
   * @param _canvas The canvas every pass on this map shares.
   */
  constructor(protected readonly _canvas: GenCanvas) {}

  /**
   * The map being drawn.
   * @returns The canvas's map.
   */
  protected get map(): WorldMap {
    return this._canvas.map;
  }

  /**
   * The generator knobs.
   * @returns The canvas's settings.
   */
  protected get gen(): MapGenSettings {
    return this._canvas.gen;
  }

  /**
   * The next number from the map's seeded PRNG.
   * @returns A number in [0, 1).
   */
  protected rand(): number {
    return this._canvas.rand();
  }
}
