// Packages
import { seededRandom } from '@halloween/shared/helpers/seeded-random';

// Local Imports
import {
  BLOCKS_FOG,
  CELLS_PER_TILE,
  DENSITY_RANGE,
} from './config/fog';
import { latticeNoise } from './helpers/lattice-noise';

// Types
import type { WorldMap } from '@halloween/shared/world/world-map';

/**
 * The fog's density field: a grid of cells over the map with a resting
 * shape (seeded per world: banks and clear patches) and the cells inside
 * tall objects (trees, walls, buildings) it never enters. `FogGrid` steps
 * it; each step's density is written into `data` for the fog's texture.
 */
export abstract class FogField {
  /**
   * Grid width, in cells.
   */
  width = 0;

  /**
   * Grid height, in cells.
   */
  height = 0;

  /**
   * The texture's bytes (rgba, density in red), written by `writeTexture`.
   */
  data = new Uint8Array(0);

  /**
   * The seed of the resting shape laid down, or null before one is.
   */
  seed: number | null = null;

  /**
   * Fog density per cell.
   */
  protected _density = new Float32Array(0);

  /**
   * Scratch density for the next step.
   */
  protected _next = new Float32Array(0);

  /**
   * The resting shape the fog settles back toward.
   */
  protected _rest = new Float32Array(0);

  /**
   * 1 for cells inside tall objects.
   */
  protected _blocked = new Uint8Array(0);

  /**
   * This step's drag along x per cell, in tiles per second.
   */
  protected _vx = new Float32Array(0);

  /**
   * This step's drag along y per cell, in tiles per second.
   */
  protected _vy = new Float32Array(0);

  /**
   * Resizes the grid. A new size starts the fog over at the next `setMap`.
   * @param width Grid width, in cells.
   * @param height Grid height, in cells.
   * @returns Whether the size changed (and `data` is a new array).
   */
  resize(width: number, height: number): boolean {
    if (width === this.width && height === this.height) {
      return false;
    }
    this.width = width;
    this.height = height;
    const size = width * height;
    this._density = new Float32Array(size);
    this._next = new Float32Array(size);
    this._rest = new Float32Array(size);
    this._blocked = new Uint8Array(size);
    this._vx = new Float32Array(size);
    this._vy = new Float32Array(size);
    this.data = new Uint8Array(size * 4);
    this.seed = null;
    return true;
  }

  /**
   * Learns which cells are inside tall objects. A new seed (a new world)
   * also lays down a fresh resting shape and starts the fog there.
   * @param map The world map.
   * @param seed The world's seed.
   */
  setMap(map: WorldMap, seed: number): void {
    const { width, height } = this;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        this._blocked[y * width + x] = BLOCKS_FOG.has(map.get(Math.floor(x / CELLS_PER_TILE), Math.floor(y / CELLS_PER_TILE))) ? 1 : 0;
      }
    }
    if (seed !== this.seed) {
      this.seed = seed;
      const rand = seededRandom(seed ^ 0x5f0a);
      const broad = latticeNoise(rand, width, height, 7 * CELLS_PER_TILE);
      const fine = latticeNoise(rand, width, height, 2.5 * CELLS_PER_TILE);
      for (let i = 0; i < this._rest.length; i++) {
        const n = broad[i] * 0.7 + fine[i] * 0.3;
        this._rest[i] = Math.min(1, Math.max(0, (n - 0.4) / 0.35));
      }
      this._density.set(this._rest);
    }
    for (let i = 0; i < this._density.length; i++) {
      if (this._blocked[i]) {
        this._density[i] = 0;
      }
    }
  }

  /**
   * Writes the density into `data` for the texture upload.
   */
  writeTexture(): void {
    for (let i = 0; i < this._density.length; i++) {
      this.data[i * 4] = Math.round(Math.min(1, this._density[i] / DENSITY_RANGE) * 255);
    }
  }
}
