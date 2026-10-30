/**
 * What monsters notice: anyone within NEAR_SIGHT tiles in any direction,
 * or within their `sight` inside SIGHT_CONE radians either side of where
 * they face, with nothing tall in between (trees don't block it). Only
 * monsters within SIGHT_SEARCH tiles of a player are checked at all.
 */
export const NEAR_SIGHT = 5;

/**
 * Radians either side of where a monster faces that its `sight` covers.
 */
export const SIGHT_CONE = 1.1;

/**
 * Tiles from a player within which monsters are checked for sight at all.
 */
export const SIGHT_SEARCH = 15;

/**
 * Zombies that can see a scarecrow within this many tiles go for it before
 * players.
 */
export const SCARECROW_RANGE = 8;

/**
 * Fraction of a light's radius that counts as lit for vampires: they wait
 * where the glow is already faint.
 */
export const LIT_FRACTION = 0.75;
