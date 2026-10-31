// Local Imports
import { stock } from '../../goods/goods';

// Types
import type { GearDef, GearKind } from '../types/gear-def';

/**
 * The armor's gear defs.
 */
export const ARMOR = {
  'wood-armor': {
    label: 'Wood armor',
    slot: 'armor',
    wear: 30,
    cost: stock({ wood: 4 }),
    loot: 2,
    guard: 0.85,
  },
  'bone-armor': {
    label: 'Bone armor',
    slot: 'armor',
    wear: 25,
    cost: stock({ bone: 8, wood: 2 }),
    loot: 1,
    guard: 0.72,
    speed: 0.95,
    thorns: 1.5,
  },
  'stone-armor': {
    label: 'Stone armor',
    slot: 'armor',
    wear: 90,
    cost: stock({ stone: 10 }),
    loot: 1,
    guard: 0.5,
    speed: 0.6,
    steady: 0,
  },
  'plate': {
    label: 'Iron plate',
    slot: 'armor',
    wear: 50,
    anvil: true,
    cost: stock({ iron: 12, chain: 4 }),
    loot: 1,
    guard: 0.6,
    speed: 0.9,
    steady: 0.5,
  },
} satisfies Partial<Record<GearKind, GearDef>>;
