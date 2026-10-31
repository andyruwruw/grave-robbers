// Local Imports
import { PLAYER_SAVE_VERSION, WORLD_SAVE_VERSION } from '../config/save';

// Types
import type { RepairLog } from '../repair-log';
import type { Raw } from './revive-values';

/**
 * Steps that bring an older `world.json` up a version, by the version they
 * start from. Only needed for changes the revivers can't work out on their
 * own (a field renamed or its meaning changed); a field added or removed
 * needs no step, since `reviveWorld` fills in defaults and ignores extras.
 */
const WORLD_STEPS: Record<number, (save: Raw) => Raw> = {};

/**
 * Steps that bring an older player file up a version, by the version they
 * start from (as WORLD_STEPS, for `revivePlayer`).
 */
const PLAYER_STEPS: Record<number, (save: Raw) => Raw> = {};

/**
 * Runs a save through whatever upgrade steps there are toward the current
 * version. Never refuses: a save with no step for its version (or from a
 * newer version) goes on as it is, for the reviver to make the best of.
 * @param save The save as read.
 * @param current The version wanted.
 * @param steps The upgrade steps.
 * @param log Where fixes are noted.
 * @returns The upgraded save.
 */
function upgrade(save: Raw, current: number, steps: Record<number, (s: Raw) => Raw>, log: RepairLog): Raw {
  let out = save;
  while (typeof out.version === 'number' && out.version < current && steps[out.version]) {
    out = { ...steps[out.version](out), version: out.version + 1 };
  }
  if (out.version !== current) {
    log.note(`read version ${String(out.version)} as ${current}`);
  }
  return out;
}

/**
 * A `world.json` brought as far toward WORLD_SAVE_VERSION as its steps go.
 * @param save The save as read.
 * @param log Where fixes are noted.
 * @returns The save.
 */
export function migrateWorld(save: Raw, log: RepairLog): Raw {
  return upgrade(save, WORLD_SAVE_VERSION, WORLD_STEPS, log);
}

/**
 * A player file brought as far toward PLAYER_SAVE_VERSION as its steps go.
 * @param save The save as read.
 * @param log Where fixes are noted.
 * @returns The save.
 */
export function migratePlayer(save: Raw, log: RepairLog): Raw {
  return upgrade(save, PLAYER_SAVE_VERSION, PLAYER_STEPS, log);
}
