// Packages
import { GOODS_LABELS } from '@halloween/shared/goods/goods-display';
import { itemLabel } from '@halloween/shared/inventory/item-keys';

// Local Imports
import { SORT_GROUP_LABELS } from '../config/sorting';

// Types
import type { Resource } from '@halloween/shared/goods/goods';
import type { ItemKey } from '@halloween/shared/inventory/item-keys';
import type { SortKey } from '@halloween/shared/structures/sorting';

/**
 * A run of sortable keys under one heading.
 */
export interface SortGroup {
  /**
   * The heading.
   */
  label: string;

  /**
   * The keys, in the order `sortableKeys` gave them.
   */
  keys: SortKey[];
}

/**
 * What a sortable thing is called.
 *
 * @param key - The thing.
 * @returns Its display name.
 */
export const sortKeyLabel = (key: SortKey): string => (key.startsWith('res:') ? GOODS_LABELS[key.slice(4) as Resource] : itemLabel(key as ItemKey));

/**
 * Splits sortable keys into gear, structures, and goods, keeping their
 * order and leaving out empty groups.
 *
 * @param keys - The keys (see `sortableKeys`).
 * @returns The groups.
 */
export const sortGroups = (keys: readonly SortKey[]): SortGroup[] => {
  const groups: Record<keyof typeof SORT_GROUP_LABELS, SortKey[]> = { gear: [], build: [], goods: [] };
  for (const key of keys) {
    const prefix = key.slice(0, key.indexOf(':'));
    groups[prefix === 'gear' || prefix === 'build' ? prefix : 'goods'].push(key);
  }
  return (Object.keys(groups) as (keyof typeof SORT_GROUP_LABELS)[])
    .filter((g: keyof typeof SORT_GROUP_LABELS): boolean => groups[g].length > 0)
    .map((g: keyof typeof SORT_GROUP_LABELS): SortGroup => ({ label: SORT_GROUP_LABELS[g], keys: groups[g] }));
};
