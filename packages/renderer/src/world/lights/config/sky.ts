// Packages
import { Color } from 'three';

/**
 * Moonlight color normally.
 */
export const MOON = new Color('#9fb4ff');

/**
 * Moonlight color under a blood moon.
 */
export const BLOOD_MOON = new Color('#ff7a66');

/**
 * How fast (per second) the scene shifts between normal and blood moon.
 */
export const BLOOD_MOON_FADE = 0.12;

/**
 * Sunlight for the Game tab's daytime.
 */
export const SUN = new Color('#fff0d4');

/**
 * How fast (per second) day breaks or night falls.
 */
export const DAY_FADE = 0.5;

/**
 * The sky light's color at night.
 */
export const NIGHT_SKY = new Color('#4a5a8a');

/**
 * The sky light's ground color at night.
 */
export const NIGHT_GROUND = new Color('#0a0a10');

/**
 * The sky light's color by day.
 */
export const DAY_SKY = new Color('#dfe8ff');

/**
 * The sky light's ground color by day.
 */
export const DAY_GROUND = new Color('#5a5040');
