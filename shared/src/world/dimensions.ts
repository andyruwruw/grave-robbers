/**
 * The classic map's size, which presets and the small generator use. A
 * world's real size is its `WorldMap.width` and `height` (a huge world is
 * HUGE_SIZE square).
 */
export const MAP_WIDTH = 56;

/**
 * The classic map's height in tiles.
 */
export const MAP_HEIGHT = 34;

/**
 * A huge world's width and height in tiles.
 */
export const HUGE_SIZE = 256;

/**
 * Terrain levels: sunken hollows at -1, the ground at 0, terraces above.
 * Each level is LEVEL_HEIGHT world units (and tiles) up. Walkers can step
 * up at most STEP_UP at once (so only stairs and steps climb a level) but
 * can always drop down.
 */
export const MIN_LEVEL = -1;

/**
 * The highest terrain level.
 */
export const MAX_LEVEL = 3;

/**
 * World units (and tiles) one level stands up.
 */
export const LEVEL_HEIGHT = 1.5;

/**
 * Most height (world units) a walker steps up at once.
 */
export const STEP_UP = 0.4;
