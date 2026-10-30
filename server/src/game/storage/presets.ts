// Packages
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';

// Local Imports
import { PRESET_DIR } from '../../config/paths';

// Types
import type { MapPreset } from './types/save';

/**
 * Every preset in `server/presets/`, by file name.
 * @returns Each preset's id (file name) and display name.
 */
export function listPresets(): { id: string; name: string }[] {
  if (!existsSync(PRESET_DIR)) {
    return [];
  }
  return readdirSync(PRESET_DIR).filter((f: string): boolean => f.endsWith('.json')).flatMap((f: string) => {
    const id = f.replace(/\.json$/, '');
    const preset = loadPreset(id);
    return preset ? [{ id, name: preset.name }] : [];
  });
}

/**
 * Saves a map as a preset under a file name made from `name` (replacing a
 * preset with the same name), for the TV's map editor.
 * @param preset The map to save.
 * @returns Its id (the file name).
 */
export function savePreset(preset: MapPreset): string {
  const id = preset.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'map';
  mkdirSync(PRESET_DIR, { recursive: true });
  writeFileSync(join(PRESET_DIR, `${id}.json`), JSON.stringify(preset, null, 2));
  return id;
}

/**
 * Reads a preset by file name.
 * @param id The preset's id (file name without `.json`).
 * @returns The preset, or null if it's missing or unreadable.
 */
export function loadPreset(id: string): MapPreset | null {
  const path = join(PRESET_DIR, `${id.replace(/[^a-z0-9-]/gi, '')}.json`);
  if (!existsSync(path)) {
    return null;
  }
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as MapPreset;
  } catch (err) {
    console.error(`[world] unreadable preset ${id}`, err);
    return null;
  }
}
