/**
 * A value snapped to its step from `min` and kept within range, without
 * floating point crumbs (0.85, not 0.8500000001).
 *
 * @param value - The raw value.
 * @param min - The smallest value.
 * @param max - The largest value.
 * @param step - How far one step goes.
 * @returns The snapped value.
 */
export const stepSetting = (value: number, min: number, max: number, step: number): number => {
  const snapped = min + Math.round((value - min) / step) * step;
  return Number(Math.max(min, Math.min(max, snapped)).toFixed(4));
};

/**
 * Whether two setting values are the same, give or take rounding.
 *
 * @param a - One value.
 * @param b - The other.
 * @returns Whether they match.
 */
export const sameSetting = (a: number, b: number): boolean => Math.abs(a - b) < 1e-6;

/**
 * A share as a percentage, or `zero` when it's 0.
 *
 * @param value - The value (1 is 100%).
 * @param zero - What 0 reads as.
 * @returns The text.
 */
export const percent = (value: number, zero = '0%'): string => (value === 0 ? zero : `${Math.round(value * 100)}%`);
