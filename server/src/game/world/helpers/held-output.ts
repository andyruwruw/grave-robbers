// Packages
import { GOODS } from '@halloween/shared/goods/goods';

// Types
import type { Goods } from '@halloween/shared/goods/goods';
import type { StructureState } from '../types/structures';

/**
 * How much a structure holds for a belt to pull (see `OUTPUT_HOLD`).
 * @param s The structure.
 * @returns Its held goods, all together.
 */
export function heldFor(s: StructureState): number {
  return GOODS.reduce((sum: number, g: Goods): number => sum + (s.out?.[g] ?? 0), 0);
}
