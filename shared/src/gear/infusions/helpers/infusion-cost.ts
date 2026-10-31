// Local Imports
import { anvilCost } from '../../../crafting/recipes';
import { ESSENCE_COSTS } from '../config/essences';
import { infusableKind, pathOf } from './infusion-paths';

// Types
import type { Bundle } from '../../../goods/goods';
import type { GearKind } from '../../types/gear-def';
import type { Essence, InfusionLevel } from '../../types/infusion';

/**
 * What infusing a kind to a level of a path costs beside an anvil: the
 * variant's own cost or the essence's standard one, less the anvil's
 * discount (see `anvilCost`).
 *
 * @param kind The gear kind (the plain hammer counts as the infused one).
 * @param essence The path's essence.
 * @param level The level it's infused to.
 * @param anvil The level of the best anvil in reach, or null for none.
 * @returns The cost, or null when the kind has no such level.
 */
export const infusionCost = (kind: GearKind, essence: Essence, level: InfusionLevel, anvil: number | null): Bundle | null => {
  const variant = pathOf(infusableKind(kind), essence)?.[level - 1];
  return variant ? anvilCost(variant.cost ?? ESSENCE_COSTS[essence][level - 1], anvil) : null;
};
