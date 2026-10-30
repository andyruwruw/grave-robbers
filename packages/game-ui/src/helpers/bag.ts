// Types
import type { GearSlot } from '@halloween/shared/gear/types/gear-def';
import type { BagItem, Gear } from '@halloween/shared/inventory/bag-items';

/**
 * What's in a bag slot or an equipped slot.
 *
 * @param gear - What's equipped and in the bag.
 * @param where - A bag index or an equipped slot.
 * @returns The item there, or null.
 */
export const itemAt = (gear: Gear, where: GearSlot | number): BagItem | null => (typeof where === 'number' ? gear.bag[where] : gear.equipped[where]);
