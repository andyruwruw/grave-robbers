// Packages
import { GEAR } from '@halloween/shared/gear/gear-catalog';
import { infusableKind, nextInfusion, pathOf } from '@halloween/shared/gear/infusions/helpers/infusion-paths';
import { affordableCount } from '@halloween/shared/inventory/affordability';
import { isBuildItem, isGearItem } from '@halloween/shared/inventory/bag-items';
import { nodeUnlocked } from '@halloween/shared/skill-tree/progress';

// Types
import type { GearKind, GearSlot } from '@halloween/shared/gear/types/gear-def';
import type { Infusion } from '@halloween/shared/gear/types/infusion';
import type { Bundle, Inventory } from '@halloween/shared/goods/goods';
import type { BagItem, Gear, GearItem } from '@halloween/shared/inventory/bag-items';
import type { TreeState } from '@halloween/shared/skill-tree/types/skill-tree';
import type { CarriedGear, InfuseFrom, LevelState } from '../types/armory';

/**
 * Every piece of gear of a weapon's family the player has on them, held
 * first, then the bag in order. The plain hammer's family is the infused
 * hammers they carry (the hammer itself is always there); a stack of
 * torches in the bag counts as one plain torch (infusing takes one off it).
 *
 * @param gear - What's equipped and in the bag.
 * @param kind - The weapon, as the Armory lists it.
 * @returns The carried gear, with where each is.
 */
export const carriedGear = (gear: Gear, kind: GearKind): CarriedGear[] => {
  const family = infusableKind(kind);
  const out: CarriedGear[] = [];
  for (const slot of Object.keys(gear.equipped) as GearSlot[]) {
    const item = gear.equipped[slot];
    if (item?.kind === family) {
      out.push({ from: slot, item });
    }
  }
  gear.bag.forEach((item: BagItem | null, i: number): void => {
    if (item && isGearItem(item) && item.kind === family) {
      out.push({ from: i, item });
    } else if (family === 'torch' && item && isBuildItem(item) && item.build === 'torch') {
      out.push({ from: i, item: { kind: 'torch', wear: GEAR.torch.wear } });
    }
  });
  return out;
};

/**
 * Where the gear is that would take one level of a path: the hammer
 * everyone has for an infused hammer's first level, else a carried piece
 * one level short of it on the same path (plain for level 1).
 *
 * @param gear - What's equipped and in the bag.
 * @param kind - The weapon, as the Armory lists it.
 * @param infusion - The level being made.
 * @returns Where it is, or null when none is carried.
 */
export const infuseSource = (gear: Gear, kind: GearKind, infusion: Infusion): InfuseFrom | null => {
  if (kind === 'hammer' && infusion.level === 1) {
    return 'hammer';
  }
  const found = carriedGear(gear, kind).find(({ item }: CarriedGear): boolean => nextInfusion(item, infusion.essence)?.level === infusion.level);
  return found?.from ?? null;
};

/**
 * Whether the player carries a weapon at a level of a path, or past it.
 *
 * @param gear - What's equipped and in the bag.
 * @param kind - The weapon, as the Armory lists it.
 * @param infusion - The level.
 * @returns True when they do.
 */
export const carriesLevel = (gear: Gear, kind: GearKind, infusion: Infusion): boolean =>
  carriedGear(gear, kind).some(({ item }: CarriedGear): boolean => item.infusion?.essence === infusion.essence && item.infusion.level >= infusion.level);

/**
 * Where one level of a path stands: owned, ready to infuse, or why not.
 * Owning one doesn't stop infusing another from a second piece carried.
 *
 * @param gear - What's equipped and in the bag.
 * @param kind - The weapon, as the Armory lists it.
 * @param infusion - The level.
 * @param cost - What it costs at the anvil in reach.
 * @param inventory - Candy and blood carried.
 * @param tree - The player's skill tree (free crafting skips the cost and
 *   the anvil).
 * @param anvil - The level of the anvil in reach, null without one.
 * @returns Its state.
 */
export const levelState = (gear: Gear, kind: GearKind, infusion: Infusion, cost: Bundle, inventory: Inventory, tree: TreeState, anvil: number | null): LevelState => {
  const owned = carriesLevel(gear, kind, infusion);
  const from = infuseSource(gear, kind, infusion);
  const affordable = !!tree.free || affordableCount(cost, inventory, gear.bag, 1) > 0;
  const reach = anvil ?? (tree.free ? 0 : null);
  const ready = reach !== null && from !== null && affordable;
  const before = infusion.level === 2 ? pathOf(infusableKind(kind), infusion.essence)?.[0].name : null;
  const note = ready || (owned && from === null) ? null
    : from === null ? `Hold or carry ${before ? `a ${before}` : `a plain ${GEAR[kind].label.toLowerCase()}`}`
      : reach === null ? 'Stand by an anvil to infuse'
        : 'Not enough to infuse';
  return { owned, from, ready, note };
};

/**
 * The best variant the player carries of a weapon (the highest level),
 * for the Armory to show first.
 *
 * @param gear - What's equipped and in the bag.
 * @param kind - The weapon, as the Armory lists it.
 * @returns Its infusion, or null when they carry none infused.
 */
export const bestCarried = (gear: Gear, kind: GearKind): Infusion | null =>
  carriedGear(gear, kind).reduce((best: Infusion | null, { item }: { item: GearItem }): Infusion | null =>
    (item.infusion && (!best || item.infusion.level > best.level) ? item.infusion : best), null);

/**
 * Whether the Armory (infusing at an anvil) is offered at all: once the
 * player's anvil node is open, or while an anvil is in reach (someone
 * else's counts). Until then its tab and key stay hidden.
 * @param tree - The player's skill tree.
 * @param anvil - The level of the anvil in reach, null without one.
 * @returns True once an anvil is available.
 */
export function armoryOpen(tree: TreeState, anvil: number | null): boolean {
  return anvil !== null || nodeUnlocked('build:anvil', tree);
}
