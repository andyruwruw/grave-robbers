// Types
import type { Tile } from '@halloween/shared/world/tiles';
import type { StockedTile } from '../types/growth';

/**
 * Shortest time a stump takes to rot away (seconds).
 */
export const STUMP_ROT_MIN = 120;

/**
 * Random extra time on top of STUMP_ROT_MIN (seconds).
 */
export const STUMP_ROT_SPREAD = 120;

/**
 * Of new gravestones rising from mounds, the share that are headstones
 * rather than crosses.
 */
export const TOMBSTONE_SHARE = 0.65;

/**
 * Roughly how often one more may appear (seconds) while below target.
 * Trees aim for the count the map was made with, pumpkins for the
 * generator's count, chests for CHEST_TARGET.
 */
export const GROW_INTERVAL: Record<StockedTile, number> = { tree: 12, pumpkin: 40, chest: 60 };

/**
 * Chests a classic-sized map keeps topped up to.
 */
export const CHEST_TARGET = 3;

/**
 * New trees go at least this far in from the fence this often (when such a
 * spot exists), so the middle stays wooded instead of the edge thickening.
 */
export const INNER_TREE_INSET = 6;

/**
 * How often a new tree goes at least INNER_TREE_INSET in from the fence.
 */
export const INNER_TREE_CHANCE = 0.7;

/**
 * Tiles a chest likes to turn up beside.
 */
export const GRAVESIDE: ReadonlySet<Tile> = new Set<Tile>(['tombstone', 'cross', 'mausoleum', 'crypt', 'hedge']);

/**
 * Tiles a new tree likes to turn up beside.
 */
export const TREES: ReadonlySet<Tile> = new Set<Tile>(['tree']);

/**
 * Tiles a new pumpkin likes to turn up beside.
 */
export const PATHS: ReadonlySet<Tile> = new Set<Tile>(['path', 'cobble']);

/**
 * Rocks the map keeps topped up to.
 */
export const ROCK_TARGET = 20;

/**
 * How often the map checks whether to grow a rock (seconds).
 */
export const ROCK_CHECK_INTERVAL = 30;
