/**
 * Darkens (or brightens) a `#rrggbb` color by scaling each channel.
 * @param hex The color, as `#rrggbb`.
 * @param factor What each channel is multiplied by.
 * @returns The shaded color, as `#rrggbb`.
 */
export const shadeHex = (hex: string, factor: number): string => '#' + [1, 3, 5].map((i: number): string => Math.round(parseInt(hex.slice(i, i + 2), 16) * factor).toString(16).padStart(2, '0')).join('');
