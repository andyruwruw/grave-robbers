// Types
import type { Bundle } from '../../goods/goods';
import type { LightDef } from '../../structures/types/structures';
import type { ArmorStats } from './armor-stats';
import type { WeaponStats } from './weapon-stats';

/**
 * Where a piece of gear goes when equipped.
 */
export type GearSlot = 'weapon' | 'offhand' | 'armor';

/**
 * Everything a player can carry in the bag and equip.
 */
export type GearKind =
  | 'hammer' | 'wood-armor' | 'bone-armor' | 'stone-armor'
  | 'battle-axe' | 'scythe' | 'spear' | 'stake' | 'ritual-knife' | 'crossbow' | 'blood-gun' | 'torch' | 'shield' | 'plate'
  | 'short-sword' | 'greatsword' | 'flail' | 'morning-star' | 'warhammer' | 'quarterstaff' | 'glaive' | 'spiked-gauntlet' | 'wrench'
  | 'bow' | 'repeating-crossbow' | 'musket'
  | 'stick' | 'femur' | 'shovel'
  | 'infused-hammer';

/**
 * One kind of gear. `wear` is how many hits a stake lasts; nothing else
 * wears out. `loot` weighs how often it turns up in graves and on dead
 * monsters. What it does for its wearer (`guard` and the armor stats) comes
 * from `ArmorStats`.
 */
export interface GearDef extends ArmorStats {
  /**
   * Name shown on the phone and in the kill feed.
   */
  label: string;

  /**
   * Where it's equipped.
   */
  slot: GearSlot;

  /**
   * Uses a fresh one has (only the stake wears out).
   */
  wear: number;

  /**
   * What one costs to craft.
   */
  cost: Bundle;

  /**
   * How often it turns up as loot, weighed against the others.
   */
  loot: number;

  /**
   * Its swing or shot, for a weapon.
   */
  weapon?: WeaponStats;

  /**
   * The light it gives off while held, if any.
   */
  light?: LightDef;

  /**
   * Late gear: only crafted within ANVIL_RADIUS of an anvil.
   */
  anvil?: boolean;

  /**
   * Junk a zombie dropped: not craftable and not in the skill tree.
   */
  junk?: boolean;

  /**
   * Wears down with use and breaks (only the stake).
   */
  breaks?: boolean;

  /**
   * Never crafted or found as its own item: the hammer everyone always
   * has, and the hand torch (a torch from a stack of torches, held).
   */
  innate?: boolean;

  /**
   * Only made by infusing at an anvil (the infused hammer): never crafted,
   * found, or carried by monsters, and not in the skill tree.
   */
  infused?: boolean;
}
