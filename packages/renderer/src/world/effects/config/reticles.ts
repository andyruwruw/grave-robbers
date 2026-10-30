// Packages
import { BoxGeometry } from 'three';

/**
 * One of the four corner ticks of the dim target over a monster a crossbow
 * is locked onto.
 */
export const RETICLE_TICK = new BoxGeometry(0.2, 0.04, 0.05);

/**
 * The target's color.
 */
export const RETICLE_COLOR = '#ff5a4a';

/**
 * The target's opacity.
 */
export const RETICLE_OPACITY = 0.55;

/**
 * How high over the monster's head the target floats.
 */
export const RETICLE_LIFT = 0.25;
