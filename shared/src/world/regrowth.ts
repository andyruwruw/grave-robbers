/**
 * What the map keeps growing back toward a target count of: trees
 * (standing or stumps), hedges, pumpkins, chests, and rocks.
 */
export type RegrowthTile = 'tree' | 'hedge' | 'pumpkin' | 'chest' | 'rock';

/**
 * Every regrowing tile, in the order the admin lists them.
 */
export const REGROWTH_TILES: RegrowthTile[] = ['tree', 'hedge', 'pumpkin', 'chest', 'rock'];

/**
 * The most of one tile the admin can ask the map to keep.
 */
export const MAX_REGROWTH_TARGET = 999;
