// Types
import type { Inventory } from '@halloween/shared/goods/goods';

/**
 * Empty pockets: no candy, no blood.
 * @returns A new inventory.
 */
export function emptyInventory(): Inventory {
  return { candy: 0, blood: 0 };
}
