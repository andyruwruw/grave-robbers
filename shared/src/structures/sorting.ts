// Local Imports
import { GEAR_KINDS } from '../gear/gear-catalog';
import { GOODS, MATERIALS, RESOURCES } from '../goods/goods';
import { itemKey } from '../inventory/item-keys';
import { TREE_NODE } from '../skill-tree/nodes';
import { nodeUnlocked } from '../skill-tree/progress';
import { STRUCTURE_KINDS } from './structure-catalog';

// Types
import type { Bundle, Goods, Material, Resource } from '../goods/goods';
import type { BagItem } from '../inventory/bag-items';
import type { ItemKey } from '../inventory/item-keys';
import type { NodeId, TreeState } from '../skill-tree/types/skill-tree';

/**
 * The four ways a belt sorter can send things, as they look on the TV.
 */
export type SortSide = 'up' | 'down' | 'left' | 'right';

/**
 * Every side, in the order the sorter's panel lists them.
 */
export const SORT_SIDES: SortSide[] = ['up', 'down', 'left', 'right'];

/**
 * Each side's step in tiles.
 */
export const SORT_STEP: Record<SortSide, [number, number]> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };

/**
 * What a sorter tells things apart by: a piece of gear, a structure, a
 * material, candy, or blood.
 */
export type SortKey = ItemKey | `res:${Resource}`;

/**
 * Goods anyone knows from the start (gathered, dug, or dropped), so a
 * sorter can always pick them; other goods show once their skill tree
 * node is open (`sortableKeys`).
 */
export const KNOWN_GOODS: readonly Goods[] = ['wood', 'stone', 'bone', 'pumpkin', 'ectoplasm', 'candy', 'blood'];

/**
 * The side a step goes.
 * @param dx Column step.
 * @param dy Row step.
 * @returns The side.
 */
export function sideOf(dx: number, dy: number): SortSide {
  return dx > 0 ? 'right' : dx < 0 ? 'left' : dy < 0 ? 'up' : 'down';
}

/**
 * What a thing on a belt is, to a sorter: the bag item it is, or else the
 * good there's most of in its pile.
 * @param item The thing.
 * @returns Its key, or null for an empty pile.
 */
export function sortKeyOf(item: Bundle & { held: BagItem | null }): SortKey | null {
  if (item.held) {
    return itemKey(item.held);
  }
  let best: Goods | null = null;
  for (const g of GOODS) {
    if (item[g] > 0 && (best === null || item[g] > item[best])) {
      best = g;
    }
  }
  return best === null ? null : goodsKey(best);
}

/**
 * A good's key.
 * @param g The good.
 * @returns `res:` for candy and blood, else `mat:`.
 */
export function goodsKey(g: Goods): SortKey {
  return (RESOURCES as string[]).includes(g) ? `res:${g as Resource}` : `mat:${g as Material}`;
}

/**
 * Everything a player may tell a sorter to send somewhere: goods everyone
 * knows, and gear, structures, and materials whose skill tree node is open
 * for them. Nothing they haven't found shows, so the list gives no secrets
 * away.
 * @param tree The player's skill tree.
 * @returns The keys, gear first, then structures, then goods.
 */
export function sortableKeys(tree: TreeState): SortKey[] {
  const open = (key: string): boolean => key in TREE_NODE && nodeUnlocked(key as NodeId, tree);
  return [
    ...GEAR_KINDS.map((k): SortKey => `gear:${k}`).filter(open),
    ...STRUCTURE_KINDS.map((k): SortKey => `build:${k}`).filter(open),
    ...MATERIALS.filter((m: Material): boolean => KNOWN_GOODS.includes(m) || open(`mat:${m}`)).map((m: Material): SortKey => `mat:${m}`),
    ...RESOURCES.map((r: Resource): SortKey => `res:${r}`),
  ];
}
