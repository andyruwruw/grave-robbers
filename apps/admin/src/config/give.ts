// Packages
import { GOODS_LABELS } from '@halloween/shared/goods/goods-display';
import { itemLabel } from '@halloween/shared/inventory/item-keys';
import { GIVE_KINDS } from '@halloween/shared/protocol/tv-tools';

// Types
import type { Resource } from '@halloween/shared/goods/goods';
import type { ItemKey } from '@halloween/shared/inventory/item-keys';
import type { GiveKind } from '@halloween/shared/protocol/tv-tools';
import type { GiveItem, GiveSection } from '../types/give';

/**
 * The amounts the Give page hands over per click (gear is capped at
 * GIVE_GEAR_MAX by the server).
 */
export const GIVE_AMOUNTS = [1, 10, 50, 99];

/**
 * A give kind's button: what it gives and its name.
 *
 * @param kind The give kind.
 * @returns Its button.
 */
function giveItem(kind: GiveKind): GiveItem {
  return { kind, label: kind.startsWith('res:') ? GOODS_LABELS[kind.slice(4) as Resource] : itemLabel(kind as ItemKey) };
}

/**
 * The give kinds whose key starts with one of some prefixes, as buttons.
 *
 * @param prefixes The prefixes.
 * @returns The buttons, in GIVE_KINDS order.
 */
function giveItems(...prefixes: string[]): GiveItem[] {
  return GIVE_KINDS.filter((k: GiveKind): boolean => prefixes.some((pre: string): boolean => k.startsWith(pre))).map(giveItem);
}

/**
 * The Give page's cards, in order: goods (candy, blood, and every
 * material), gear, and buildables.
 */
export const GIVE_SECTIONS: GiveSection[] = [
  { title: 'Goods', items: giveItems('res:', 'mat:') },
  { title: 'Gear', items: giveItems('gear:') },
  { title: 'Buildables', items: giveItems('build:') },
];
