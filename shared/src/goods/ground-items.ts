// Types
import type { BagItem } from '../inventory/bag-items';
import type { Bundle } from './goods';

/**
 * How much the Drop button throws at once.
 */
export const DROP_AMOUNT = 5;

/**
 * Distance (tiles) at which walking over an item picks it up.
 */
export const PICKUP_RADIUS = 0.6;

/**
 * Something lying on the ground: a pile of goods (picked up by walking over
 * it; materials go into the bag), or one bag item, a piece of gear or a
 * stack of structures, with nothing else (picked up with Grab).
 */
export interface ItemState extends Bundle {
  /**
   * Unique id among the items on the ground.
   */
  id: number;

  /**
   * Tile-space x.
   */
  x: number;

  /**
   * Tile-space y.
   */
  y: number;

  /**
   * The one bag item it is, or null for a pile of goods.
   */
  held: BagItem | null;
}
