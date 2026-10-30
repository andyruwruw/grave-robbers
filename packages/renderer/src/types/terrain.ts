// Types
import type { WorldMap } from '@halloween/shared/world/world-map';
import type { VoxelBatch } from '../graveyard/voxel-batch';

/**
 * A world-space point or size: x, y, z.
 */
export type Vec = [number, number, number];

/**
 * Somewhere to put boxes.
 */
export type Batch = Pick<VoxelBatch, 'add'>;

/**
 * Everything a tile painter needs: the batches, a per-tile PRNG, the tile's
 * world-space center, the height its contents stand on (its terrain level),
 * and the map for neighbor checks.
 */
export interface Paint {
  /**
   * Boxes lit by the light map.
   */
  lit: Batch;

  /**
   * Boxes that glow on their own.
   */
  glow: Batch;

  /**
   * The tile's seeded PRNG.
   */
  rand: () => number;

  /**
   * The map, for neighbor checks.
   */
  map: WorldMap;

  /**
   * The tile's x.
   */
  tx: number;

  /**
   * The tile's y.
   */
  ty: number;

  /**
   * World-space x of the tile's center.
   */
  x: number;

  /**
   * World-space z of the tile's center.
   */
  z: number;

  /**
   * Height the tile's contents stand on.
   */
  base: number;
}

/**
 * A light that never goes out, baked into the map.
 */
export interface StaticLight {
  /**
   * Tile-space x.
   */
  x: number;

  /**
   * Tile-space y.
   */
  y: number;

  /**
   * What kind of light it is.
   */
  kind: 'pumpkin' | 'lamp' | 'candle';
}

/**
 * A rectangle of tiles (a chunk): its corner and size.
 */
export interface ChunkRegion {
  /**
   * Left tile.
   */
  x: number;

  /**
   * Top tile.
   */
  y: number;

  /**
   * Width, in tiles.
   */
  w: number;

  /**
   * Height, in tiles.
   */
  h: number;
}
