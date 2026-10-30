// Local Imports
import { GEAR } from '../gear/gear-catalog';
import { GOODS_LABELS } from '../goods/goods-display';
import { STRUCTURES } from '../structures/structure-catalog';
import { isBuildItem, isMaterialItem } from './bag-items';

// Types
import type { GearKind } from '../gear/types/gear-def';
import type { Material } from '../goods/goods';
import type { NodeId } from '../skill-tree/types/skill-tree';
import type { StructureKind } from '../structures/types/structures';
import type { BagItem } from './bag-items';

/**
 * Names a piece of gear or a structure, the things that are crafted (both
 * have a torch, hence the prefix).
 */
export type CraftKey = `gear:${GearKind}` | `build:${StructureKind}`;

/**
 * Names one kind of thing a bag slot can hold.
 */
export type ItemKey = CraftKey | `mat:${Material}`;

/**
 * The key naming what a bag item is.
 *
 * @param item The bag item.
 * @returns Its ItemKey.
 */
export function itemKey(item: BagItem): ItemKey {
  return isBuildItem(item) ? `build:${item.build}` : isMaterialItem(item) ? `mat:${item.material}` : `gear:${item.kind}`;
}

/**
 * What a kind of item is called on the phone and in the kill feed.
 *
 * @param key The item's key.
 * @returns Its display name.
 */
export function itemLabel(key: ItemKey): string {
  const [kind, what] = key.split(':') as ['gear', GearKind] | ['build', StructureKind] | ['mat', Material];
  return kind === 'gear' ? GEAR[what].label : kind === 'build' ? STRUCTURES[what].label : GOODS_LABELS[what];
}

/**
 * Display names of some nodes, for the TV feed.
 *
 * @param ids The nodes.
 * @returns Their display names, in the same order.
 */
export function itemNames(ids: NodeId[]): string[] {
  return ids.map((id: NodeId): string => itemLabel(id));
}
