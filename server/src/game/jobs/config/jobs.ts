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
 * Swings it takes to break down a structure (it goes back to the bag).
 */
export const BREAK_HITS = 3;

/**
 * Seconds without a swing before a structure being broken down is whole
 * again.
 */
export const BREAK_RESET_SECONDS = 2;
