// Local Imports
import { stock } from '../../goods/goods';

// Types
import type { GearDef, GearKind } from '../types/gear-def';
import type { WeaponStats } from '../types/weapon-stats';

/**
 * The hammer everyone always has and that never breaks: every gathering
 * and building swing uses it whatever weapon is equipped (it comes out for
 * the job and goes away after), and it's the weapon when none is.
 */
export const HAMMER: WeaponStats = { damage: 2, cooldown: 0.55, reach: 1.8, arcCos: 0.2, knockback: 0.5, chop: 1 };

/**
 * The melee weapons' gear defs, the hammer first.
 */
export const MELEE_WEAPONS = {
  'hammer': {
    label: 'Hammer',
    slot: 'weapon',
    wear: 999,
    cost: stock({}),
    loot: 0,
    innate: true,
    weapon: HAMMER,
  },
  'battle-axe': {
    label: 'Battle axe',
    slot: 'weapon',
    wear: 1,
    cost: stock({ wood: 3, stone: 2 }),
    loot: 3,
    weapon: { damage: 12, cooldown: 1.6, reach: 1.9, arcCos: -0.2, knockback: 1.8, hands: 2, cleave: 0.25, windup: 0.7 },
  },
  'scythe': {
    label: 'Scythe',
    slot: 'weapon',
    wear: 1,
    anvil: true,
    cost: stock({ planks: 3, iron: 3 }),
    loot: 1,
    weapon: { damage: 2.8, cooldown: 0.8, reach: 2.4, arcCos: -0.7, knockback: 1.6, hands: 2 },
  },
  'spear': {
    label: 'Ghoul Poker',
    slot: 'weapon',
    wear: 1,
    cost: stock({ wood: 2 }),
    loot: 3,
    weapon: { damage: 1.5, cooldown: 0.55, reach: 2.7, arcCos: 0.75, knockback: 1.2, line: 0.45 },
  },
  'stake': {
    label: 'Stake',
    slot: 'weapon',
    wear: 1,
    breaks: true,
    cost: stock({ wood: 1 }),
    loot: 3,
    weapon: { damage: 1, cooldown: 0.4, reach: 1.4, arcCos: 0.3, knockback: 0.6, slays: 'vampire' },
  },
  'ritual-knife': {
    label: 'Ritual knife',
    slot: 'weapon',
    wear: 1,
    anvil: true,
    cost: stock({ silver: 2, bone: 3 }),
    loot: 1,
    weapon: { damage: 4, cooldown: 0.35, reach: 1.5, arcCos: 0.4, knockback: 0.5, hpCost: 1, feast: 4 },
  },
  'short-sword': {
    label: 'Short sword',
    slot: 'weapon',
    wear: 1,
    anvil: true,
    cost: stock({ planks: 1, iron: 2 }),
    loot: 2,
    weapon: { damage: 3, cooldown: 0.4, reach: 1.7, arcCos: 0.2, knockback: 0.8 },
  },
  'greatsword': {
    label: 'Hell\'s Greatsword',
    slot: 'weapon',
    wear: 1,
    anvil: true,
    cost: stock({ planks: 2, iron: 6, bloodsteel: 1 }),
    loot: 1,
    weapon: { damage: 8, cooldown: 0.95, reach: 2.2, arcCos: -0.3, knockback: 1.6, hands: 2 },
  },
  'flail': {
    label: 'Flail',
    slot: 'weapon',
    wear: 1,
    anvil: true,
    cost: stock({ planks: 2, iron: 4 }),
    loot: 1,
    weapon: { damage: 6, cooldown: 0.75, reach: 2, arcCos: -0.2, knockback: 2.2, crush: true },
  },
  'morning-star': {
    label: 'Mourning Star',
    slot: 'weapon',
    wear: 1,
    anvil: true,
    cost: stock({ planks: 2, iron: 3, chain: 2, silver: 1 }),
    loot: 1,
    weapon: { damage: 5, cooldown: 0.8, reach: 3.2, arcCos: -0.2, knockback: 1.2, stagger: 0.25, line: 0.5, blessed: 2, windup: 0.35 },
  },
  'warhammer': {
    label: 'Warhammer',
    slot: 'weapon',
    wear: 1,
    anvil: true,
    cost: stock({ planks: 2, stone: 2, iron: 4 }),
    loot: 1,
    weapon: { damage: 14, cooldown: 1.8, reach: 1.8, arcCos: 0.1, knockback: 3.2, bruteBane: 1.5, windup: 0.8 },
  },
  'quarterstaff': {
    label: 'Holy Quarterstaff',
    slot: 'weapon',
    wear: 1,
    cost: stock({ planks: 3 }),
    loot: 2,
    weapon: { damage: 3, cooldown: 0.45, reach: 2.4, arcCos: -0.5, knockback: 2, hands: 2, deflect: 0.85, stun: 0.2, combo: [{ mult: 1 }, { mult: 1 }, { mult: 1.3 }] },
  },
  'glaive': {
    label: 'Cursed Glaive',
    slot: 'weapon',
    wear: 1,
    anvil: true,
    cost: stock({ planks: 3, iron: 5, silver: 1 }),
    loot: 1,
    weapon: { damage: 5.5, cooldown: 0.75, reach: 2.8, arcCos: 0.2, knockback: 1.4, hands: 2, tip: 1.4, combo: [{ mult: 1 }, { mult: 1, line: 0.45, reach: 0.3 }] },
  },
  'spiked-gauntlet': {
    label: 'Spiked gauntlet',
    slot: 'weapon',
    wear: 1,
    anvil: true,
    cost: stock({ iron: 2, bone: 3 }),
    loot: 1,
    weapon: { damage: 2.2, cooldown: 0.28, reach: 1.2, arcCos: 0.5, knockback: 0.6, bleed: 1, hands: 2, combo: [{ mult: 1 }, { mult: 1 }, { mult: 1.15 }], charge: 6 },
  },
} satisfies Partial<Record<GearKind, GearDef>>;
