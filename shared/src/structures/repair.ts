// Local Imports
import { MATERIALS } from '../goods/goods';
import { STRUCTURES } from './structure-catalog';

// Types
import type { Material } from '../goods/goods';
import type { StructureKind } from './types/structures';

/**
 * What one wrench swing at a structure costs to mend it: one of the
 * material its recipe uses most (the first listed on a tie), or null for
 * one built from no material (seeds).
 *
 * @param kind The structure.
 * @returns The material, or null.
 */
export function repairMaterial(kind: StructureKind): Material | null {
  const cost = STRUCTURES[kind].cost;
  let best: Material | null = null;
  for (const m of MATERIALS) {
    if (cost[m] > 0 && (best === null || cost[m] > cost[best])) {
      best = m;
    }
  }
  return best;
}
