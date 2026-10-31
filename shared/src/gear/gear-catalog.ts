// Local Imports
import { ARMOR } from './defs/armor';
import { JUNK_WEAPON_DEFS } from './defs/junk-weapons';
import { MELEE_WEAPONS } from './defs/melee-weapons';
import { OFFHAND } from './defs/offhand';
import { RANGED_WEAPONS } from './defs/ranged-weapons';

// Types
import type { GearDef, GearKind, GearSlot } from './types/gear-def';

/**
 * Every gear slot.
 */
export const GEAR_SLOTS: GearSlot[] = ['weapon', 'offhand', 'armor'];

/**
 * Every gear kind, in Craft list and skill tree order (the infused hammer
 * is in neither: see `GearDef.infused`).
 */
export const GEAR_KINDS: GearKind[] = [
  'hammer', 'infused-hammer', 'wood-armor', 'bone-armor', 'stone-armor',
  'battle-axe', 'scythe', 'spear', 'stake', 'ritual-knife', 'crossbow', 'blood-gun', 'torch', 'shield', 'plate',
  'short-sword', 'greatsword', 'flail', 'morning-star', 'warhammer', 'quarterstaff', 'glaive', 'spiked-gauntlet', 'wrench',
  'bow', 'repeating-crossbow', 'musket',
  'stick', 'femur', 'shovel',
];

/**
 * Whether a piece of gear wears out (only the stake).
 *
 * @param kind The gear kind.
 * @returns True for gear that breaks.
 */
export function wearsOut(kind: GearKind): boolean {
  return !!GEAR[kind].breaks;
}

/**
 * Whether a weapon needs both hands (no shield alongside it).
 *
 * @param kind The weapon, or nothing.
 * @returns True for a two-handed weapon.
 */
export function twoHanded(kind: GearKind | null | undefined): boolean {
  return !!kind && GEAR[kind].weapon?.hands === 2;
}

/**
 * Every gear kind's def, gathered from `defs/` in the original key order.
 */
export const GEAR: Record<GearKind, GearDef> = {
  'hammer': MELEE_WEAPONS.hammer,
  'infused-hammer': MELEE_WEAPONS['infused-hammer'],
  'wood-armor': ARMOR['wood-armor'],
  'bone-armor': ARMOR['bone-armor'],
  'stone-armor': ARMOR['stone-armor'],
  'battle-axe': MELEE_WEAPONS['battle-axe'],
  'scythe': MELEE_WEAPONS.scythe,
  'spear': MELEE_WEAPONS.spear,
  'stake': MELEE_WEAPONS.stake,
  'crossbow': RANGED_WEAPONS.crossbow,
  'ritual-knife': MELEE_WEAPONS['ritual-knife'],
  'blood-gun': RANGED_WEAPONS['blood-gun'],
  'short-sword': MELEE_WEAPONS['short-sword'],
  'greatsword': MELEE_WEAPONS.greatsword,
  'flail': MELEE_WEAPONS.flail,
  'morning-star': MELEE_WEAPONS['morning-star'],
  'warhammer': MELEE_WEAPONS.warhammer,
  'quarterstaff': MELEE_WEAPONS.quarterstaff,
  'glaive': MELEE_WEAPONS.glaive,
  'spiked-gauntlet': MELEE_WEAPONS['spiked-gauntlet'],
  'wrench': MELEE_WEAPONS.wrench,
  'bow': RANGED_WEAPONS.bow,
  'repeating-crossbow': RANGED_WEAPONS['repeating-crossbow'],
  'musket': RANGED_WEAPONS.musket,
  'torch': OFFHAND.torch,
  'shield': OFFHAND.shield,
  'plate': ARMOR.plate,
  'stick': JUNK_WEAPON_DEFS.stick,
  'femur': JUNK_WEAPON_DEFS.femur,
  'shovel': JUNK_WEAPON_DEFS.shovel,
};
