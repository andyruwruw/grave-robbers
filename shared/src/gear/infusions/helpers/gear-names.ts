// Local Imports
import { GEAR } from '../../gear-catalog';
import { ESSENCE_PREFIX } from '../config/essences';
import { itemVariant } from './infusion-paths';

// Types
import type { GearItem } from '../../../inventory/bag-items';

/**
 * What a piece of gear is called: its variant's name once infused,
 * otherwise its kind's label.
 *
 * @param item The item.
 * @returns Its display name.
 */
export const gearLabel = (item: Pick<GearItem, 'kind' | 'infusion'>): string => itemVariant(item)?.name ?? GEAR[item.kind].label;

/**
 * The prefix shown under an infused item's name (Blessed, Hulking, ...).
 *
 * @param item The item.
 * @returns Its prefix, or null for a plain item.
 */
export const gearPrefix = (item: Pick<GearItem, 'kind' | 'infusion'>): string | null => {
  const variant = itemVariant(item);
  return variant && item.infusion ? variant.prefix ?? ESSENCE_PREFIX[item.infusion.essence] : null;
};
