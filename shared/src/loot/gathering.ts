// Types
import type { Material } from '../goods/goods';
import type { Tile } from '../world/tiles';

/**
 * A tile that's gathered by hitting it: `hits` to bring it down, then all
 * `amount` of `resource` at once.
 */
export interface Gatherable {
  /**
   * What it gives, if anything.
   */
  resource: Material | null;

  /**
   * Hits it takes to bring down.
   */
  hits: number;

  /**
   * How much of `resource` it gives, all at once.
   */
  amount: number;

  /**
   * What's left on the tile afterwards.
   */
  leaves: Tile;
}

/**
 * The tiles gathered by hitting them, and what each gives.
 */
export const GATHERABLE: Partial<Record<Tile, Gatherable>> = {
  tree: { resource: 'wood', hits: 5, amount: 2, leaves: 'stump' },
  rock: { resource: 'stone', hits: 5, amount: 2, leaves: 'grass' },
  hedge: { resource: 'wood', hits: 2, amount: 1, leaves: 'grass' },
};
