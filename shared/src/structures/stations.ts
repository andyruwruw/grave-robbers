// Local Imports
import { stock } from '../goods/goods';

// Types
import type { Station, StructureKind } from './types/structures';

/**
 * Every station's recipe: what one batch takes, what it makes, and how long it
 * takes.
 */
export const STATIONS: Partial<Record<StructureKind, Station>> = {
  'sawmill': { input: stock({ wood: 1 }), output: stock({ planks: 1 }), seconds: 4, queue: 5 },
  'furnace': { input: stock({ stone: 1 }), output: stock({ iron: 1 }), seconds: 6, queue: 5 },
  'sifter': { input: stock({ stone: 2 }), output: stock({ silver: 1 }), seconds: 7, queue: 5 },
  'bloodforge': { input: stock({ iron: 1, blood: 2 }), output: stock({ bloodsteel: 1 }), seconds: 8, queue: 5 },
  'quarry': { input: stock(), output: stock({ stone: 1 }), seconds: 30, queue: 5 },
  'cauldron': { input: stock({ candy: 3, blood: 1, bone: 1 }), output: stock({ tonic: 1 }), seconds: 6, queue: 5 },
  'oven': { input: stock({ pumpkin: 1, bone: 2, blood: 1 }), output: stock({ candy: 4 }), seconds: 10, queue: 5 },
};

/**
 * Stations (and the bone digger) reach this far (tiles, from their middle)
 * for piles to work through, and hand what they make straight to a station
 * this close that takes it, so a row of them runs on its own.
 */
export const STATION_REACH = 1.6;

/**
 * Crafting late gear and parts needs an anvil within ANVIL_RADIUS tiles;
 * each level of the best anvil in reach takes ANVIL_DISCOUNT_PER_LEVEL off
 * their materials (rounded up).
 */
export const ANVIL_RADIUS = 2.5;

/**
 * Fraction of anvil recipes' materials each anvil level takes off.
 */
export const ANVIL_DISCOUNT_PER_LEVEL = 0.15;

/**
 * A storage chest's slots, and how far its owner can step from it before
 * the phone closes it.
 */
export const STASH_SLOTS = 16;

/**
 * How far (tiles) a stash's owner can step from it before the phone closes it.
 */
export const STASH_REACH = 2.5;
