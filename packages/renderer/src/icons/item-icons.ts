// Local Imports
import { SPIN_FRAMES } from './config/icons';
import { IconRenderer } from './icon-renderer';

// Types
import type { IconKey } from '../types/icons';

/**
 * The one renderer every icon is drawn with.
 */
const renderer = new IconRenderer();

/**
 * Still icons drawn so far, by key.
 */
const cache = new Map<IconKey, string>();

/**
 * Spinning icons drawn so far, by key.
 */
const spins = new Map<IconKey, string[]>();

/**
 * An image URL of a little 3D model of the item, drawn once and cached.
 * @param key What the icon shows.
 * @returns The image's data URL.
 */
export function itemIconUrl(key: IconKey): string {
  let url = cache.get(key);
  if (!url) {
    url = renderer.render(key, null);
    cache.set(key, url);
  }
  return url;
}

/**
 * Image URLs of the item's model turning once around, framed the same in
 * every frame so it spins in place. Drawn once and cached.
 * @param key What the icon shows.
 * @returns The frames' data URLs, in order.
 */
export function itemSpinUrls(key: IconKey): string[] {
  let frames = spins.get(key);
  if (!frames) {
    frames = Array.from({ length: SPIN_FRAMES }, (_, i: number): string => renderer.render(key, (i / SPIN_FRAMES) * Math.PI * 2));
    spins.set(key, frames);
  }
  return frames;
}
