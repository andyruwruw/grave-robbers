// Packages
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from 'node:fs';
import { dirname } from 'node:path';

// Local Imports
import { WORLD_SAVE_PATH } from '../../config/paths';
import { WORLD_SAVE_VERSION } from './config/save';

// Types
import type { WorldSave } from './types/save';

/**
 * Reads the saved world, or null if there is none or it can't be parsed.
 * @returns The save, or null.
 */
export function loadWorld(): WorldSave | null {
  if (!existsSync(WORLD_SAVE_PATH)) {
    return null;
  }
  try {
    const save = JSON.parse(readFileSync(WORLD_SAVE_PATH, 'utf8')) as WorldSave;
    return save.version === WORLD_SAVE_VERSION ? save : null;
  } catch (err) {
    console.error('[world] unreadable save, starting fresh', err);
    return null;
  }
}

/**
 * Writes the world atomically (temp file, then rename).
 * @param save The world to write.
 */
export function saveWorld(save: WorldSave): void {
  mkdirSync(dirname(WORLD_SAVE_PATH), { recursive: true });
  const tmp = `${WORLD_SAVE_PATH}.tmp`;
  writeFileSync(tmp, JSON.stringify(save));
  renameSync(tmp, WORLD_SAVE_PATH);
}
