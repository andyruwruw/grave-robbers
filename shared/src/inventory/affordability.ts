// Local Imports
import { MATERIALS, RESOURCES } from '../goods/goods';
import { isMaterialItem } from './bag-items';

// Types
import type { Bundle, Inventory, Material, Resource } from '../goods/goods';
import type { BagItem } from './bag-items';

/**
 * How much of a material is in a bag, across its stacks.
 *
 * @param bag The bag's slots.
 * @param material The material to count.
 * @returns The total count.
 */
export function bagCount(bag: readonly (BagItem | null)[], material: Material): number {
  return bag.reduce((n: number, item: BagItem | null): number => n + (item && isMaterialItem(item) && item.material === material ? item.count : 0), 0);
}

/**
 * How many times over candy and blood in the pockets and materials in the
 * bag cover `cost` (at most `cap`).
 *
 * @param cost The cost of one.
 * @param inventory Candy and blood in the pockets.
 * @param bag The bag's slots.
 * @param cap The most to count.
 * @returns How many can be paid for.
 */
export function affordableCount(cost: Bundle, inventory: Inventory, bag: readonly (BagItem | null)[], cap = 99): number {
  let n = cap;
  for (const r of RESOURCES) {
    if (cost[r] > 0) {
      n = Math.min(n, Math.floor(inventory[r] / cost[r]));
    }
  }
  for (const m of MATERIALS) {
    if (cost[m] > 0) {
      n = Math.min(n, Math.floor(bagCount(bag, m) / cost[m]));
    }
  }
  return n;
}

/**
 * Whether candy and blood in the pockets and materials in the bag cover
 * `cost`.
 *
 * @param cost The cost.
 * @param inventory Candy and blood in the pockets.
 * @param bag The bag's slots.
 * @returns True when everything is covered.
 */
export function canAfford(cost: Bundle, inventory: Inventory, bag: readonly (BagItem | null)[]): boolean {
  return RESOURCES.every((r: Resource): boolean => inventory[r] >= cost[r])
    && MATERIALS.every((m: Material): boolean => bagCount(bag, m) >= cost[m]);
}
