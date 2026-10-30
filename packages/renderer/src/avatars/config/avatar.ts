// Packages
import { BoxGeometry } from 'three';

/**
 * The unit box every avatar part and swoosh bit is scaled from.
 */
export const UNIT_BOX = new BoxGeometry(1, 1, 1);

/**
 * How quickly the rendered position chases the server position (per second).
 */
export const FOLLOW_RATE = 18;

/**
 * The red a hit flashes the body.
 */
export const HURT_COLOR = '#ff2020';

/**
 * How long a hit flashes the body red, in seconds.
 */
export const HURT_FLASH_TIME = 0.18;
