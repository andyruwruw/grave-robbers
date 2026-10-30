// Types
import type { GearSlot } from '@halloween/shared/gear/types/gear-def';

/**
 * A slot in the bag panel: an equipped slot or a bag index.
 */
export type SlotWhere = GearSlot | number;

/**
 * What's picked up: a bag or equipped slot.
 */
export type Picked = {
  /**
   * The slot it was picked up from.
   */
  from: SlotWhere;
};

/**
 * How a slot is drawn: picked up, equipped, where the picked gear can go,
 * or plain.
 */
export type SlotTone = 'picked' | 'equipped' | 'target' | 'plain';
