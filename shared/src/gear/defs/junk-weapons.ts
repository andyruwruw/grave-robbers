// Local Imports
import { stock } from '../../goods/goods';

// Types
import type { GearDef, GearKind } from '../types/gear-def';

/**
 * Junk some zombies carry and drop: never craftable, never in graves, and
 * never better than the hammer at what matters (each has one odd perk).
 */
export const JUNK_WEAPONS: GearKind[] = ['stick', 'femur', 'shovel'];

/**
 * The junk weapons' gear defs.
 */
export const JUNK_WEAPON_DEFS = {
  'stick': {
    label: 'Stick',
    slot: 'weapon',
    wear: 15,
    cost: stock({}),
    loot: 0,
    junk: true,
    weapon: { damage: 2, cooldown: 0.55, reach: 2.1, arcCos: 0.2, knockback: 0.8 },
  },
  'femur': {
    label: 'Femur club',
    slot: 'weapon',
    wear: 12,
    cost: stock({}),
    loot: 0,
    junk: true,
    weapon: { damage: 2.5, cooldown: 0.75, reach: 1.4, arcCos: 0, knockback: 1.8 },
  },
  'shovel': {
    label: 'Bent shovel',
    slot: 'weapon',
    wear: 18,
    cost: stock({}),
    loot: 0,
    junk: true,
    weapon: { damage: 2, cooldown: 0.6, reach: 1.7, arcCos: -0.3, knockback: 1 },
  },
} satisfies Partial<Record<GearKind, GearDef>>;
