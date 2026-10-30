// Types
import type { Tile } from '../../world/tiles';

/**
 * What the map editor's Mix brush scatters, in the order their shares are
 * laid out along the noise (so each gets its own evenly spread tiles).
 */
export const BLEND_KEYS = ['tree', 'rock', 'tombstone', 'cross', 'pumpkin', 'hedge'] as const;

/**
 * One kind the Mix brush scatters.
 */
export type BlendKey = (typeof BLEND_KEYS)[number];

/**
 * A Mix brush setting: the percentage of tiles each kind takes (the rest
 * is bare ground).
 */
export type Blend = Partial<Record<BlendKey, number>>;

/**
 * Each scattered kind's name, for the editor's sliders.
 */
export const BLEND_LABELS: Record<BlendKey, string> = {
  tree: 'Trees',
  rock: 'Rocks',
  tombstone: 'Headstones',
  cross: 'Crosses',
  pumpkin: 'Pumpkins',
  hedge: 'Hedges',
};

/**
 * Tiles the Mix brush may repaint: grass and the scenery it scatters (and
 * what those become: stumps and dug-up mounds). Paths, paving, stairs,
 * landmarks, and built things are left alone.
 */
export const BLEND_TILES: ReadonlySet<Tile> = new Set<Tile>(['grass', 'tree', 'stump', 'rock', 'tombstone', 'cross', 'mound', 'pumpkin', 'hedge']);

/**
 * The scattered kinds that are graves (and so need room to stand, see
 * `graveFits`).
 */
export const GRAVES: ReadonlySet<Tile> = new Set<Tile>(['tombstone', 'cross']);

/**
 * Whole percentages, none negative, adding up to at most 100 (scaled down
 * if over). Anything that isn't a Blend comes back empty.
 *
 * @param raw Anything, from a message or a save.
 * @returns A valid Blend.
 */
export function cleanBlend(raw: unknown): Blend {
  const out: Blend = {};
  if (!raw || typeof raw !== 'object') {
    return out;
  }
  for (const key of BLEND_KEYS) {
    const v = (raw as Record<string, unknown>)[key];
    if (typeof v === 'number' && Number.isFinite(v) && v > 0) {
      out[key] = Math.min(100, Math.round(v));
    }
  }
  const total = BLEND_KEYS.reduce((sum: number, k: BlendKey): number => sum + (out[k] ?? 0), 0);
  if (total > 100) {
    for (const key of BLEND_KEYS) {
      if (out[key]) {
        out[key] = Math.floor((out[key]! * 100) / total);
      }
    }
  }
  return out;
}

/**
 * A Blend as a short canonical string ("tree:30,rock:5"), empty for none.
 *
 * @param blend The setting.
 * @returns Its key.
 */
export function blendKey(blend: Blend): string {
  return BLEND_KEYS.filter((k: BlendKey): boolean => (blend[k] ?? 0) > 0).map((k: BlendKey): string => `${k}:${blend[k]}`).join(',');
}

/**
 * A Blend back from its key (see `blendKey`).
 *
 * @param key The key.
 * @returns The setting it names.
 */
export function parseBlendKey(key: string): Blend {
  return cleanBlend(Object.fromEntries(key.split(',').filter(Boolean).map((part: string): [string, number] => {
    const [k, v] = part.split(':');
    return [k, Number(v)];
  })));
}
