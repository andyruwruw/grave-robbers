// Packages
import { BUILD_STACK, isGearItem, isMaterialItem } from '@halloween/shared/inventory/bag-items';
import { itemKey } from '@halloween/shared/inventory/item-keys';
import { MATERIAL_STACK } from '@halloween/shared/goods/goods';

// Types
import type { BagItem } from '@halloween/shared/inventory/bag-items';

/**
 * Puts a bag item into a row of slots: onto matching stacks first (up to
 * their limits), then the first free slot.
 * @param slots The slots, changed in place.
 * @param item What goes in.
 * @returns What didn't fit, or null.
 */
export function putInto(slots: (BagItem | null)[], item: BagItem): BagItem | null {
  if (isGearItem(item)) {
    const free = slots.indexOf(null);
    if (free < 0) {
      return item;
    }
    slots[free] = item;
    return null;
  }
  const limit = isMaterialItem(item) ? MATERIAL_STACK : BUILD_STACK;
  let left = item.count;
  for (const other of slots) {
    if (left > 0 && other && !isGearItem(other) && itemKey(other) === itemKey(item) && other.count < limit) {
      const moved = Math.min(left, limit - other.count);
      other.count += moved;
      left -= moved;
    }
  }
  for (let i = 0; i < slots.length && left > 0; i++) {
    if (!slots[i]) {
      const moved = Math.min(left, limit);
      slots[i] = { ...item, count: moved };
      left -= moved;
    }
  }
  return left > 0 ? { ...item, count: left } : null;
}
