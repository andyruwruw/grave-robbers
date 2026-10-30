// Local Imports
import { MAP_HEIGHT, MAP_WIDTH } from '../../world/dimensions';

/**
 * Remembered Mix settings as saved and sent: each setting's key and the
 * tile indexes painted with it.
 */
export type BlendAreas = Record<string, number[]>;

/**
 * Groups each tile's remembered Mix setting into areas, for saving and
 * sending.
 *
 * @param byTile Each painted tile's setting key, by tile index.
 * @returns The tile indexes painted with each key.
 */
export function packBlends(byTile: Map<number, string>): BlendAreas {
  const out: BlendAreas = {};
  for (const [i, key] of byTile) {
    (out[key] ??= []).push(i);
  }
  return out;
}

/**
 * Each tile's remembered Mix setting from saved or sent areas, dropping
 * indexes off the map.
 *
 * @param areas The areas, if any.
 * @param size How many tiles the map has.
 * @returns Each painted tile's setting key, by tile index.
 */
export function unpackBlends(areas: BlendAreas | undefined, size = MAP_WIDTH * MAP_HEIGHT): Map<number, string> {
  const out = new Map<number, string>();
  for (const [key, list] of Object.entries(areas ?? {})) {
    if (Array.isArray(list)) {
      for (const i of list) {
        if (Number.isInteger(i) && i >= 0 && i < size) {
          out.set(i, key);
        }
      }
    }
  }
  return out;
}
