// Packages
import { Color } from 'three';

/**
 * Darkens (or brightens) a `#rrggbb` color by scaling each channel.
 * @param hex The color, as `#rrggbb`.
 * @param factor What each channel is multiplied by.
 * @returns The shaded color, as `#rrggbb`.
 */
export const shadeHex = (hex: string, factor: number): string => '#' + [1, 3, 5].map((i: number): string => Math.round(parseInt(hex.slice(i, i + 2), 16) * factor).toString(16).padStart(2, '0')).join('');

/**
 * Every color `hexColor` has made, by hex.
 */
const HEX_COLORS = new Map<string, Color>();

/**
 * One shared Color per hex string, so per-frame code doesn't allocate.
 * Read it, copy it, or lerp toward it, but never change it.
 * @param hex The color, as `#rrggbb`.
 * @returns The color.
 */
export function hexColor(hex: string): Color {
  let c = HEX_COLORS.get(hex);
  if (!c) {
    c = new Color(hex);
    HEX_COLORS.set(hex, c);
  }
  return c;
}
