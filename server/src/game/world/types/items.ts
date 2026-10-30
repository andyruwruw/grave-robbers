// Types
import type { BagItem } from '@halloween/shared/inventory/bag-items';
import type { ItemState } from '@halloween/shared/goods/ground-items';

/**
 * Server-side item: the dropper can't re-collect it straight away, and
 * what spilled when a player died is theirs alone (`ownerId`; not saved).
 */
export interface GroundItem extends ItemState {
  /**
   * The player who dropped it, or null.
   */
  dropperId: string | null;

  /**
   * When its dropper may pick it back up (world seconds).
   */
  pickupAfter: number;

  /**
   * The only player who may pick it up, or null for anyone.
   */
  ownerId: string | null;
}

/**
 * A bag item lying under a player, for walking over to pick it up.
 */
export interface HeldUnder {
  /**
   * The ground item's id.
   */
  id: number;

  /**
   * What is lying there.
   */
  held: BagItem;
}
