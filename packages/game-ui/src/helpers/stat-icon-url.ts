// Types
import type { StatColor, StatIcon } from '../types/stat-icons';

/**
 * Every pre-rendered image, by file name without the extension.
 */
const URLS: Record<string, string> = Object.fromEntries(
  Object.entries(import.meta.glob<string>('../assets/stat-icons/*.png', { eager: true, import: 'default', query: '?url' }))
    .map(([path, url]): [string, string] => [path.slice(path.lastIndexOf('/') + 1, -4), url]),
);

/**
 * Where a stat or trait icon's image is.
 *
 * @param icon The icon.
 * @returns Its URL.
 */
export function statIconUrl(icon: StatIcon): string {
  return URLS[icon];
}

/**
 * Where a stat bar block's image is: filled in a stat's color, or empty.
 *
 * @param color The stat's color, or null for an empty block.
 * @returns Its URL.
 */
export function statBlockUrl(color: StatColor | null): string {
  return URLS[`block-${color ?? 'empty'}`];
}
