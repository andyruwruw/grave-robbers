/**
 * Districts: classic graveyards laid out on a DISTRICT_GRID square grid,
 * each nudged randomly within its cell, kept DISTRICT_EDGE tiles in from
 * the map's edge. The middle one keeps its spawn.
 */
export const DISTRICT_GRID = 3;

/**
 * How far in from the map's edge (tiles) every district stays.
 */
export const DISTRICT_EDGE = 12;

/**
 * The chasm around the map: at least RING_MIN tiles deep, up to
 * RING_MIN + RING_WOBBLE where the noise pushes it in.
 */
export const RING_MIN = 3;

/**
 * How much deeper than RING_MIN the noise pushes the ring in, at most.
 */
export const RING_WOBBLE = 4;

/**
 * Crevasses winding through the wilds: where a noise field crosses its
 * middle (within CREVASSE_WIDTH), kept CREVASSE_CLEARANCE tiles from any
 * district. Plus SINKHOLES round pits.
 */
export const CREVASSE_SCALE = 46;

/**
 * How near the noise's middle (0.5) a tile must be to fall into a crevasse.
 */
export const CREVASSE_WIDTH = 0.03;

/**
 * Tiles every crevasse and sinkhole keeps from a district.
 */
export const CREVASSE_CLEARANCE = 5;

/**
 * Round pits dotted over the wilds.
 */
export const SINKHOLES = 7;

/**
 * Wild woods: thick where the forest noise is high, a scattering of trees,
 * rocks, pumpkins, and lone graves everywhere else (each times its knob).
 */
export const FOREST_SCALE = 20;

/**
 * Forest noise above this grows thick woods.
 */
export const FOREST_FROM = 0.5;

/**
 * Chance of a lone tree on a wild tile.
 */
export const LONE_TREES = 0.03;

/**
 * Chance of a lone rock on a wild tile.
 */
export const LONE_ROCKS = 0.012;

/**
 * Chance of a lone pumpkin on a wild tile.
 */
export const LONE_PUMPKINS = 0.0015;

/**
 * Chance of a lone grave on a wild tile.
 */
export const LONE_GRAVES = 0.004;

/**
 * How far into a district (tiles) a road cuts through its woods to meet it.
 */
export const ROAD_REACH = 5;
