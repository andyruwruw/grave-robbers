/**
 * Seconds of predicted positions kept to compare snapshots against.
 */
export const HISTORY_KEEP = 1.5;

/**
 * How far (tiles) the server can disagree before the prediction gives up
 * and jumps to it (knocked back, lifted, respawned).
 */
export const SNAP_DISTANCE = 1.5;

/**
 * How much of a smaller disagreement each snapshot fixes.
 */
export const CORRECTION = 0.25;

/**
 * How small (tiles) a disagreement is ignored.
 */
export const ERROR_IGNORE = 0.02;
