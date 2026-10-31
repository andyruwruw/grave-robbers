// Types
import type { GearSlot } from '@halloween/shared/gear/types/gear-def';
import type { GearItem } from '@halloween/shared/inventory/bag-items';

/**
 * Where the gear to infuse is: an equipped slot, a bag index, or 'hammer'
 * for the hammer everyone has.
 */
export type InfuseFrom = GearSlot | number | 'hammer';

/**
 * One piece of gear the player has on them, and where it is.
 */
export interface CarriedGear {
  /**
   * An equipped slot or a bag index.
   */
  from: GearSlot | number;

  /**
   * The item.
   */
  item: GearItem;
}

/**
 * Where one level of a path stands for the player.
 */
export interface LevelState {
  /**
   * Whether they already carry a weapon at this level of the path (or past
   * it).
   */
  owned: boolean;

  /**
   * The gear that would take this level, or null when they carry none.
   */
  from: InfuseFrom | null;

  /**
   * Whether Infuse works now: an anvil in reach, gear to infuse, and the
   * cost carried.
   */
  ready: boolean;

  /**
   * Why it doesn't, in words (null when it does, or when it's owned with
   * nothing more to infuse).
   */
  note: string | null;
}
