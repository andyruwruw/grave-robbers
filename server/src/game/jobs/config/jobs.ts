// Types
import type { Tile } from '@halloween/shared/world/tiles';

/**
 * Tiles (besides structures and gatherables) the hammer comes out for.
 */
export const HAMMER_JOBS = new Set<string>(['pumpkin', 'chest', 'tombstone', 'cross', 'statue', 'crypt', 'mausoleum', 'lamp']);

/**
 * Structures that throw stone chips when hit.
 */
export const STONE_STRUCTURES: ReadonlySet<Tile> = new Set<Tile>(['stone-wall', 'furnace', 'altar', 'bloodforge', 'bone-wall', 'cauldron']);

/**
 * Most wood a chest holds (a random amount from 1).
 */
export const CHEST_WOOD = 3;

/**
 * Most candy a chest holds (a random amount from 1).
 */
export const CHEST_CANDY = 5;

/**
 * Most bolts a chest holds, when it holds any (a random amount from 1).
 */
export const CHEST_BOLTS = 9;

/**
 * Chance a chest holds bolts at all.
 */
export const CHEST_BOLT_CHANCE = 0.5;
