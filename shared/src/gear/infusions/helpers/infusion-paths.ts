// Local Imports
import { GEAR } from '../../gear-catalog';
import { VARIANTS } from '../config/variants';

// Types
import type { GearItem } from '../../../inventory/bag-items';
import type { GearKind } from '../../types/gear-def';
import type { Essence, Infusion, InfusionLevel } from '../../types/infusion';
import type { Variant, VariantPath } from '../types/variant';

/**
 * The kind whose paths a kind follows: the plain hammer's are the infused
 * hammer's (infusing it makes one), every other kind's are its own.
 *
 * @param kind The gear kind.
 * @returns The kind to look up in VARIANTS.
 */
export const infusableKind = (kind: GearKind): GearKind => (kind === 'hammer' ? 'infused-hammer' : kind);

/**
 * The essences a kind can be infused with (empty for the stake, junk,
 * armor, and anything else without paths).
 *
 * @param kind The gear kind (the plain hammer counts as the infused one).
 * @returns Its paths' essences.
 */
export const pathsFor = (kind: GearKind): Essence[] => Object.keys(VARIANTS[infusableKind(kind)] ?? {}) as Essence[];

/**
 * One path of a kind, if it has it (the plain hammer has none of its own:
 * see `infusableKind`).
 *
 * @param kind The gear kind.
 * @param essence The essence.
 * @returns The path's variants, level 1 first, or null.
 */
export const pathOf = (kind: GearKind, essence: Essence): VariantPath | null => VARIANTS[kind]?.[essence] ?? null;

/**
 * The variant an infusion makes of a kind.
 *
 * @param kind The gear kind.
 * @param infusion The infusion, if any.
 * @returns The variant, or null for none (or one that doesn't exist).
 */
export const variantOf = (kind: GearKind, infusion: Infusion | null | undefined): Variant | null =>
  (infusion ? pathOf(kind, infusion.essence)?.[infusion.level - 1] ?? null : null);

/**
 * The variant a piece of gear is.
 *
 * @param item The item, or null.
 * @returns Its variant, or null for a plain item.
 */
export const itemVariant = (item: Pick<GearItem, 'kind' | 'infusion'> | null | undefined): Variant | null =>
  (item ? variantOf(item.kind, item.infusion) : null);

/**
 * The highest level a path reaches (0 for a path the kind doesn't have).
 *
 * @param kind The gear kind (the plain hammer counts as the infused one).
 * @param essence The essence.
 * @returns 0, 1, or 2.
 */
export const maxInfusionLevel = (kind: GearKind, essence: Essence): number => pathOf(infusableKind(kind), essence)?.length ?? 0;

/**
 * The infusion an item would get from infusing it with an essence: the
 * next level of its path. None when the kind has no such path, the item is
 * already locked into another essence, or the path is at its last level.
 *
 * @param item The item (a plain hammer, `{ kind: 'hammer' }`, stands for
 * the hammer everyone has).
 * @param essence The essence.
 * @returns The new infusion, or null when it can't be infused that way.
 */
export const nextInfusion = (item: Pick<GearItem, 'kind' | 'infusion'>, essence: Essence): Infusion | null => {
  const path = pathOf(infusableKind(item.kind), essence);
  if (!path || (item.infusion && item.infusion.essence !== essence)) {
    return null;
  }
  const level = (item.infusion?.level ?? 0) + 1;
  return level <= path.length ? { essence, level: level as InfusionLevel } : null;
};

/**
 * Whether an item can take its next infusion of an essence (see
 * `nextInfusion`; cost and the anvil aren't checked).
 *
 * @param item The item.
 * @param essence The essence.
 * @returns True when it can.
 */
export const canInfuse = (item: Pick<GearItem, 'kind' | 'infusion'>, essence: Essence): boolean => nextInfusion(item, essence) !== null;

/**
 * The item infusing makes: the same item one level further along, or, for
 * the plain hammer, a fresh infused hammer at level 1.
 *
 * @param item The item (`{ kind: 'hammer', ... }` for the hammer everyone
 * has).
 * @param essence The essence.
 * @returns A new item, or null when it can't be infused that way.
 */
export const infusedItem = (item: GearItem, essence: Essence): GearItem | null => {
  const infusion = nextInfusion(item, essence);
  if (!infusion) {
    return null;
  }
  return item.kind === 'hammer' ? { kind: 'infused-hammer', wear: GEAR['infused-hammer'].wear, infusion } : { ...item, infusion };
};
