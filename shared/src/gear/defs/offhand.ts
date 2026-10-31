// Local Imports
import { stock } from '../../goods/goods';

// Types
import type { GearDef, GearKind } from '../types/gear-def';

/**
 * A shield only works while held up (the phone's Block button, and only
 * beside a one-handed weapon): hits from the front are cut to BLOCK_GUARD
 * of their damage (less with upgrades) and wear the shield, and the player
 * moves at BLOCK_SLOW of their speed and can't attack.
 */
export const BLOCK_GUARD = 0.12;

/**
 * Fraction of their speed a player moves at with a shield held up.
 */
export const BLOCK_SLOW = 0.5;

/**
 * The off-hand gear defs: the hand torch and the shield.
 */
export const OFFHAND = {
  'torch': {
    label: 'Torch',
    slot: 'offhand',
    wear: 180,
    cost: stock({ wood: 1 }),
    loot: 0,
    innate: true,
    light: { radius: 3.5, burn: Infinity, color: '#ffb866', intensity: 0.9 },
  },
  'shield': {
    label: 'Shield',
    slot: 'offhand',
    wear: 30,
    cost: stock({ wood: 5 }),
    loot: 2,
    guard: BLOCK_GUARD,
  },
} satisfies Partial<Record<GearKind, GearDef>>;
