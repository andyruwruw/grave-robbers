/**
 * Blends linearly from one number to another.
 * @param a The value at t = 0.
 * @param b The value at t = 1.
 * @param t How far along, 0..1.
 * @returns The blended value.
 */
export function mix(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Smallest signed difference between two angles.
 * @param from The starting angle, in radians.
 * @param to The target angle, in radians.
 * @returns The turn from `from` to `to`, in -PI..PI.
 */
export function angleDelta(from: number, to: number): number {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
}
