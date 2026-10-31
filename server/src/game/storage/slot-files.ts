// Packages
import {
  existsSync,
  readFileSync,
  readdirSync,
  renameSync,
} from 'node:fs';
import { join } from 'node:path';
import { DEFAULT_GAME_SETTINGS } from '@halloween/shared/protocol/game-settings';
import { MIN_LEVEL } from '@halloween/shared/world/dimensions';
import { WorldMap } from '@halloween/shared/world/world-map';

// Local Imports
import { CHUNK_SIZE, WORLD_SAVE_VERSION } from './config/save';
import {
  chunkKeys,
  decodeChunks,
  encodeChunk,
  TILE_PALETTE,
} from './helpers/chunk-codec';
import { migratePlayer, migrateWorld } from './helpers/migrate';
import { playerSaveOf } from './helpers/player-save';
import { revivePlayer } from './helpers/revive-player';
import { reviveStructures, reviveWorld } from './helpers/revive-world';
import { RepairLog } from './repair-log';
import { commitFolder, recoverFolder } from './save-folder';

// Types
import type { Game } from '../game';
import type {
  LegacyWorldSave,
  LoadedSlot,
  LoadedWorld,
  PlayerSave,
  WorldSave,
} from './types/save';

/**
 * Reads a JSON file, or null if it's missing or unreadable.
 * @param path The file.
 * @returns What it holds, or null.
 */
function readJson(path: string): Record<string, unknown> | null {
  if (!existsSync(path)) {
    return null;
  }
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
  } catch (err) {
    console.error(`[save] unreadable ${path}`, err);
    return null;
  }
}

/**
 * Moves a file it can't use out of the way (kept beside it, never
 * deleted) so the slot can carry on.
 * @param path The file.
 */
function setAside(path: string): void {
  const to = `${path}.unreadable-${Date.now()}`;
  console.error(`[save] can't read ${path}, kept as ${to}`);
  renameSync(path, to);
}

/**
 * Reads a slot's world and characters, finishing any save a crash cut
 * short first, and repairing rather than refusing: every field that's
 * missing or bad gets its default and what no longer exists is dropped
 * (`reviveWorld`, `revivePlayer`), with one log line per file saying what
 * was fixed. Only a file that isn't JSON at all is set aside; a world whose
 * `world.json` is lost is rebuilt from its chunks at the size `slot.json`
 * remembers.
 * @param dir The slot's folder.
 * @returns What it holds.
 */
export function readSlot(dir: string): LoadedSlot {
  recoverFolder(dir);
  const worldPath = join(dir, 'world.json');
  const log = new RepairLog();
  let raw = readJson(worldPath);
  if (!raw && existsSync(worldPath)) {
    setAside(worldPath);
  }
  if (!raw) {
    const slot = readJson(join(dir, 'slot.json'));
    if (slot && existsSync(join(dir, 'chunks'))) {
      log.note('rebuilt the world from its chunks (world.json lost)');
      raw = { width: slot.width, height: slot.height };
    }
  }
  const save = raw ? reviveWorld(migrateWorld(raw, log), log) : null;
  let world: LoadedWorld | null = null;
  if (save) {
    const map = decodeChunks(save.width, save.height, save, (key: string): Uint8Array | null => {
      const path = join(dir, 'chunks', `${key}.bin`);
      return existsSync(path) ? readFileSync(path) : null;
    }, (what: string): void => log.note(what));
    save.structures = reviveStructures(save.structures, map, log);
    const rewrite = save.chunkSize !== CHUNK_SIZE || save.minLevel !== MIN_LEVEL || save.palette.join() !== TILE_PALETTE.join();
    world = { save, map, rewrite };
  }
  log.report(worldPath);
  const players: PlayerSave[] = [];
  const repaired: string[] = [];
  const folder = join(dir, 'players');
  for (const file of existsSync(folder) ? readdirSync(folder) : []) {
    if (!file.endsWith('.json')) {
      continue;
    }
    const playerLog = new RepairLog();
    const rawPlayer = readJson(join(folder, file));
    const player = rawPlayer ? revivePlayer(migratePlayer(rawPlayer, playerLog), playerLog) : null;
    if (!player) {
      setAside(join(folder, file));
      continue;
    }
    if (players.some((p: PlayerSave): boolean => p.id === player.id)) {
      console.error(`[save] ${file} is a second copy of ${player.name}, skipped`);
      continue;
    }
    playerLog.report(join(folder, file));
    if (playerLog.any) {
      repaired.push(player.id);
    }
    players.push(player);
  }
  return { world, players, repaired };
}

/**
 * Saves the game into its slot as one commit (see `commitFolder`): the
 * world's `world.json`, only the chunks changed since the last save, every
 * player in the game (not the test player), and every away character that
 * changed; released characters' files go. If it fails, the chunks are
 * marked changed again so the next save writes them.
 * @param dir The slot's folder.
 * @param game The game.
 * @returns How many chunks and players it wrote.
 */
export function saveSlot(dir: string, game: Game): { chunks: number; players: number } {
  const { world, roster } = game;
  const files = new Map<string, string | Uint8Array>();
  files.set('world.json', JSON.stringify(game.worldSave()));
  const keys = world.chunks.take();
  for (const key of keys) {
    files.set(`chunks/${key}.bin`, encodeChunk(world.map, key));
  }
  const removed: string[] = [];
  const all = chunkKeys(world.map.width, world.map.height);
  if (keys.length === all.length && existsSync(join(dir, 'chunks'))) {
    const kept = new Set(all.map((key: string): string => `${key}.bin`));
    removed.push(...readdirSync(join(dir, 'chunks')).filter((f: string): boolean => !kept.has(f)).map((f: string): string => `chunks/${f}`));
  }
  let players = 0;
  for (const p of roster.players.values()) {
    if (p.token !== game.testBot.token) {
      files.set(`players/${p.id}.json`, JSON.stringify(playerSaveOf(p)));
      players++;
    }
  }
  for (const id of roster.changed) {
    const away = roster.away.get(id);
    if (away) {
      files.set(`players/${id}.json`, JSON.stringify(away));
      players++;
    }
  }
  removed.push(...[...roster.released].map((id: string): string => `players/${id}.json`));
  try {
    commitFolder(dir, files, removed);
  } catch (err) {
    world.chunks.mark(keys);
    throw err;
  }
  roster.changed.clear();
  roster.released.clear();
  return { chunks: keys.length, players };
}

/**
 * Writes the old single-file save into a new slot's folder: its world and
 * every chunk (it kept no players). The old file is renamed, not deleted.
 * @param path The old save.
 * @param dir The new slot's folder.
 * @returns Whether there was an old save to bring in.
 */
export function importLegacy(path: string, dir: string): boolean {
  const legacy = readJson(path) as LegacyWorldSave | null;
  const map = legacy?.version === 8 ? WorldMap.decode(legacy.tiles, legacy.levels, legacy.ramps, legacy.width) : null;
  if (!legacy || !map) {
    return false;
  }
  const { tiles: _tiles, levels: _levels, ramps: _ramps, ...rest } = legacy;
  const save: WorldSave = { ...rest, version: WORLD_SAVE_VERSION, width: map.width, height: map.height, palette: TILE_PALETTE, chunkSize: CHUNK_SIZE, minLevel: MIN_LEVEL, settings: { ...DEFAULT_GAME_SETTINGS, spawning: !(rest.quiet ?? false) }, worldLevel: 0 };
  const files = new Map<string, string | Uint8Array>([['world.json', JSON.stringify(save)]]);
  for (const key of chunkKeys(map.width, map.height)) {
    files.set(`chunks/${key}.bin`, encodeChunk(map, key));
  }
  commitFolder(dir, files);
  renameSync(path, `${path}.imported`);
  console.log(`[save] brought ${path} into ${dir}`);
  return true;
}
