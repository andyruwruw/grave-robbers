// Types
import type { GearKind, GearSlot } from '../gear/types/gear-def';
import type { Infusion } from '../gear/types/infusion';
import type { Material } from '../goods/goods';
import type { StructureKind } from '../structures/types/structures';

/**
 * One piece of gear and how much use it has left.
 */
export interface GearItem {
  /**
   * What it is.
   */
  kind: GearKind;

  /**
   * Uses left.
   */
  wear: number;

  /**
   * A crossbow's bolts shot since it was last loaded, and whether it needs
   * reloading before it can shoot again (kept with the crossbow, so
   * putting it away mid-reload doesn't skip it).
   */
  fired?: number;

  /**
   * Whether the crossbow needs reloading before it can shoot again.
   */
  empty?: boolean;

  /**
   * What it's been infused with at an anvil, if anything (see
   * `docs/infusions.md`): with `kind` it names its variant.
   */
  infusion?: Infusion;
}

/**
 * A stack of crafted structures waiting to be placed.
 */
export interface BuildItem {
  /**
   * What it places.
   */
  build: StructureKind;

  /**
   * How many are in the stack.
   */
  count: number;
}

/**
 * A stack of one material.
 */
export interface MaterialItem {
  /**
   * What it is.
   */
  material: Material;

  /**
   * How much is in the stack.
   */
  count: number;
}

/**
 * Anything a bag slot can hold. Only gear and structures lie on the ground
 * as items; dropped materials become a pile.
 */
export type BagItem = GearItem | BuildItem | MaterialItem;

/**
 * Whether a bag item is a stack of structures.
 *
 * @param item The bag item.
 * @returns True for a BuildItem.
 */
export function isBuildItem(item: BagItem): item is BuildItem {
  return 'build' in item;
}

/**
 * Whether a bag item is a stack of a material.
 *
 * @param item The bag item.
 * @returns True for a MaterialItem.
 */
export function isMaterialItem(item: BagItem): item is MaterialItem {
  return 'material' in item;
}

/**
 * Whether a bag item is a piece of gear.
 *
 * @param item The bag item.
 * @returns True for a GearItem.
 */
export function isGearItem(item: BagItem): item is GearItem {
  return 'kind' in item;
}

/**
 * Most structures of one kind a bag slot holds.
 */
export const BUILD_STACK = 99;

/**
 * Slots in the bag, besides the equipped ones.
 */
export const BAG_SLOTS = 24;

/**
 * What a player has equipped and in their bag (null is an empty slot).
 */
export interface Gear {
  /**
   * What's in each equipped slot.
   */
  equipped: Record<GearSlot, GearItem | null>;

  /**
   * The bag's slots (BAG_SLOTS of them).
   */
  bag: (BagItem | null)[];
}

/**
 * A fresh player's gear: nothing equipped and an empty bag.
 * @returns New, empty gear (a new object each call).
 */
export function emptyGear(): Gear {
  return { equipped: { weapon: null, offhand: null, armor: null }, bag: Array.from({ length: BAG_SLOTS }, (): null => null) };
}
