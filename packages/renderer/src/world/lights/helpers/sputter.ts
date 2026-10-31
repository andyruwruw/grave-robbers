// Local Imports
import { SPUTTER_DIM, SPUTTER_RATE } from '../config/lights';

/**
 * A dying light's stutter as a blackout puts it out: it cuts out at
 * random, more and more often as the moment comes.
 * @param time Clock seconds.
 * @param seed A number unique to the light.
 * @param left How much of its sputter is left, 1 to 0.
 * @returns A 0..1 multiplier.
 */
export function sputter(time: number, seed: number, left: number): number {
  const near = 1 - Math.max(0, Math.min(1, left));
  const step = Math.floor(time * SPUTTER_RATE);
  const roll = Math.abs(Math.sin(step * 12.9898 + seed * 78.233) * 43758.5453) % 1;
  return roll < 0.2 + 0.65 * near ? SPUTTER_DIM : 1 - 0.3 * roll;
}
