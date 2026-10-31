/**
 * Chain lightning: a white-hot core in a golden sheath (holy).
 */
export const CHAIN_COLORS = { core: '#fffbe8', sheath: '#ffd65a' };

/**
 * Seconds a chain lightning arc flickers.
 */
export const CHAIN_LIFE = 0.26;

/**
 * Seconds between re-jagging a lightning arc (its crackle).
 */
export const CHAIN_JITTER = 0.045;

/**
 * Kinks in each hop of a lightning arc.
 */
export const CHAIN_KINKS = 5;

/**
 * How far (world units) a kink strays from the straight line.
 */
export const CHAIN_STRAY = 0.16;

/**
 * Most arc segments drawn at once.
 */
export const CHAIN_POOL = 120;

/**
 * Seconds a shockwave ring takes to spread and fade.
 */
export const RING_LIFE = 0.38;

/**
 * Most shockwave rings drawn at once.
 */
export const RING_POOL = 16;

/**
 * An Earthshaker's fissure: the dark crack and its hot inner seam.
 */
export const FISSURE_COLORS = { crack: '#120c08', seam: '#a8401a' };

/**
 * Seconds a fissure stays open.
 */
export const FISSURE_LIFE = 2.2;

/**
 * Seconds a fissure takes to run its whole length.
 */
export const FISSURE_RUN = 0.18;

/**
 * Length (tiles) of each zigzag in a fissure.
 */
export const FISSURE_STEP = 0.32;

/**
 * Most fissure boxes drawn at once (two per zigzag).
 */
export const FISSURE_POOL = 80;
