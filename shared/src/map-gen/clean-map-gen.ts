// Local Imports
import { DEFAULT_MAP_GEN, MAP_GEN_RANGES, MAP_STRUCTURES } from './settings';

// Types
import type { MapGenSettings } from './settings';

/**
 * Settings from a message or storage, with anything missing or out of range
 * replaced by the default.
 *
 * @param raw Anything, from a message or storage.
 * @returns Valid settings.
 */
export function cleanMapGen(raw: unknown): MapGenSettings {
  const given = (raw && typeof raw === 'object' ? raw : {}) as Partial<MapGenSettings>;
  const out: MapGenSettings = { ...DEFAULT_MAP_GEN, structures: { ...DEFAULT_MAP_GEN.structures } };
  for (const { key, min, max } of MAP_GEN_RANGES) {
    const v = given[key];
    if (typeof v === 'number' && Number.isFinite(v)) {
      out[key] = Math.min(max, Math.max(min, v));
    }
  }
  if (given.size === 'huge') {
    out.size = 'huge';
  }
  for (const { key } of MAP_STRUCTURES) {
    const v = given.structures?.[key];
    if (typeof v === 'boolean') {
      out.structures[key] = v;
    }
  }
  return out;
}
