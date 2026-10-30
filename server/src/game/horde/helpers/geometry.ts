// Types
import type { Step } from '../../pathing/types/path';

/**
 * The tile a point stands on.
 * @param m The point.
 * @returns Its tile.
 */
export function tileOf(m: { x: number; y: number }): Step {
  return { tx: Math.floor(m.x), ty: Math.floor(m.y) };
}

/**
 * Straight-line distance between two points.
 * @param a One point.
 * @param b The other point.
 * @returns The distance (tiles).
 */
export function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * How far an angle is off a facing, wrapped to the short way round.
 * @param angle The angle (radians).
 * @param facing The facing (radians).
 * @returns The unsigned difference, 0 to PI.
 */
export function angleOff(angle: number, facing: number): number {
  return Math.abs(Math.atan2(Math.sin(angle - facing), Math.cos(angle - facing)));
}
