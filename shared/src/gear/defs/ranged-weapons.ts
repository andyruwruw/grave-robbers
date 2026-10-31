// Local Imports
import { stock } from '../../goods/goods';

// Types
import type { GearDef, GearKind } from '../types/gear-def';

/**
 * The ranged weapons' gear defs.
 */
export const RANGED_WEAPONS = {
  'crossbow': {
    label: 'CrossBones',
    slot: 'weapon',
    wear: 1,
    cost: stock({ wood: 2, planks: 3 }),
    loot: 1,
    weapon: { damage: 10, cooldown: 0.4, reach: 7.5, arcCos: 1, knockback: 1.2, ranged: true, ammo: 'bolts', holy: 3, hands: 2, sight: 0.35, pierce: 1, burst: 1, reload: 1.4 },
  },
  'blood-gun': {
    label: 'Nightmare blunderbuss',
    slot: 'weapon',
    wear: 1,
    anvil: true,
    cost: stock({ planks: 3, iron: 2, 'cursed-core': 1 }),
    loot: 0,
    weapon: { damage: 3, cooldown: 1.1, reach: 5, arcCos: 1, knockback: 1.2, ranged: true, ammo: 'blood', hands: 2, pellets: 5, spread: 0.3 },
  },
  'bow': {
    label: 'Bow',
    slot: 'weapon',
    wear: 1,
    cost: stock({ wood: 2 }),
    loot: 2,
    weapon: { damage: 4.5, cooldown: 0.45, reach: 7, arcCos: 1, knockback: 0.6, ranged: true, ammo: 'arrows', hands: 2, draw: 0.8 },
  },
  'repeating-crossbow': {
    label: 'Rattlebones',
    slot: 'weapon',
    wear: 1,
    anvil: true,
    cost: stock({ planks: 5, iron: 4, chain: 1 }),
    loot: 1,
    weapon: { damage: 5, cooldown: 0.2, reach: 7, arcCos: 1, knockback: 0.6, ranged: true, ammo: 'bolts', holy: 2, hands: 2, burst: 3, reload: 1 },
  },
  'musket': {
    label: 'Blood Lust Musket',
    slot: 'weapon',
    wear: 1,
    anvil: true,
    cost: stock({ planks: 4, iron: 3, 'cursed-core': 2 }),
    loot: 0,
    weapon: { damage: 20, cooldown: 1.8, reach: 10, arcCos: 1, knockback: 3.5, ranged: true, ammo: 'blood', hands: 2 },
  },
} satisfies Partial<Record<GearKind, GearDef>>;
