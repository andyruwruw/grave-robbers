// Packages
import { Vector3 } from 'three';

/**
 * Icon size in pixels; drawn chunky on purpose, like the TV.
 */
export const ICON_PX = 40;

/**
 * Frames in one turn of a spinning model.
 */
export const SPIN_FRAMES = 36;

/**
 * Looking down from the front right, like the TV but a little lower.
 */
export const VIEW = new Vector3(0.9, 1.1, 1.6).normalize();
