// Types
import type { Rounding } from './types/rounding';

/**
 * Holds a number between two bounds.
 *
 * @param n The number.
 * @param lo The lowest it may be.
 * @param hi The highest it may be.
 * @returns The number, held within lo to hi.
 */
export function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

/**
 * Rounds to one decimal place.
 *
 * @param n The number.
 * @returns The number rounded to the nearest tenth.
 */
export function roundTenth(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * Rounds to a tenth, to a hundredth, or not at all (`Math.round(n * 10) /
 * 10` and `Math.round(n * 100) / 100`, the same steps as written out).
 *
 * @param n The number.
 * @param rounding How finely to round.
 * @returns The rounded number.
 */
export const roundTo = (n: number, rounding: Rounding): number => {
  if (rounding === 'tenth') {
    return Math.round(n * 10) / 10;
  }
  if (rounding === 'hundredth') {
    return Math.round(n * 100) / 100;
  }
  return n;
};
