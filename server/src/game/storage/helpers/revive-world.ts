// Packages
import { clampDifficulty } from '@halloween/shared/difficulty/difficulty';
import { WORLD_LEVEL_BOOST_MAX } from '@halloween/shared/difficulty/world-level';
import { GEAR } from '@halloween/shared/gear/gear-catalog';
import { MATERIALS, RESOURCES, stock } from '@halloween/shared/goods/goods';
import { DEFAULT_GAME_SETTINGS } from '@halloween/shared/protocol/game-settings';
import { STASH_SLOTS } from '@halloween/shared/structures/stations';
import { SORT_SIDES } from '@halloween/shared/structures/sorting';
import { STRUCTURES, isStructure } from '@halloween/shared/structures/structure-catalog';
import { MIN_LEVEL } from '@halloween/shared/world/dimensions';
import { CHAR_BY_TILE } from '@halloween/shared/world/tile-codec';

// Local Imports
import { freshStructure } from '../../world/helpers/fresh-structure';
import { CHUNK_SIZE, WORLD_SAVE_VERSION } from '../config/save';
import { TILE_PALETTE } from './chunk-codec';
import { reviveBagItem, reviveBundle, reviveSlots } from './revive-items';
import {
  int,
  isRaw,
  list,
  num,
  optNum,
} from './revive-values';

// Types
import type { ItemState } from '@halloween/shared/goods/ground-items';
import type { GameSettings } from '@halloween/shared/protocol/game-settings';
import type { MapView } from '@halloween/shared/protocol/tv-tools';
import type { SortKey, SortSide } from '@halloween/shared/structures/sorting';
import type { Tile } from '@halloween/shared/world/tiles';
import type { WorldMap } from '@halloween/shared/world/world-map';
import type { StructureState } from '../../world/types/structures';
import type { RepairLog } from '../repair-log';
import type { WorldSave } from '../types/save';
import type { Raw } from './revive-values';

/**
 * The Game tab's switches: each kept if it's the right type, else its
 * default (so a switch added later starts at its default).
 * @param v The saved settings.
 * @param log Where fixes are noted.
 * @returns The settings.
 */
export function reviveSettings(v: unknown, log: RepairLog): GameSettings {
  if (!isRaw(v)) {
    log.note(v === undefined ? 'filled in missing settings' : 'replaced bad settings');
  }
  const raw = isRaw(v) ? v : {};
  const out: Record<string, unknown> = { ...DEFAULT_GAME_SETTINGS };
  for (const key of Object.keys(DEFAULT_GAME_SETTINGS) as (keyof GameSettings)[]) {
    if (typeof raw[key] === typeof DEFAULT_GAME_SETTINGS[key]) {
      out[key] = raw[key];
    } else if (isRaw(v)) {
      log.note(raw[key] === undefined ? `filled in missing setting ${key}` : `replaced bad setting ${key}`);
    }
  }
  const settings = out as unknown as GameSettings;
  settings.difficulty = clampDifficulty(settings.difficulty);
  settings.levelBoost = Math.min(WORLD_LEVEL_BOOST_MAX, Math.max(0, Math.round(settings.levelBoost) || 0));
  return settings;
}

/**
 * A `world.json`, field by field: anything missing or bad falls back to its
 * default, and bad entries in lists are dropped. Null only when the map's
 * size is unknown, since then the terrain can't be rebuilt.
 * @param raw The save as read (already through its upgrade steps).
 * @param log Where fixes are noted.
 * @returns The save, or null.
 */
export function reviveWorld(raw: Raw, log: RepairLog): WorldSave | null {
  const width = int(raw.width, 0, log, 'width', 0);
  const height = int(raw.height, 0, log, 'height', 0);
  if (width < 1 || height < 1) {
    return null;
  }
  const size = width * height;
  const index = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v < size;
  const timer = (v: unknown): [number, number] | null => (Array.isArray(v) && index(v[0]) && typeof v[1] === 'number' && Number.isFinite(v[1]) ? [v[0], v[1]] : null);
  const structure = (v: unknown): [number, StructureState] | null => (Array.isArray(v) && index(v[0]) && isRaw(v[1]) ? [v[0], v[1] as unknown as StructureState] : null);
  const palette = Array.isArray(raw.palette) && raw.palette.every((t: unknown): boolean => typeof t === 'string') ? raw.palette as string[] : null;
  if (!palette) {
    log.note('assumed the current tile list (palette missing)');
  }
  return {
    version: WORLD_SAVE_VERSION,
    seed: int(raw.seed, 0, log, 'seed'),
    width,
    height,
    palette: palette ?? TILE_PALETTE,
    chunkSize: int(raw.chunkSize, CHUNK_SIZE, log, 'chunk size', 1),
    minLevel: int(raw.minLevel, MIN_LEVEL, log, 'lowest level'),
    blends: reviveBlends(raw.blends, size, log),
    view: reviveView(raw.view, log),
    quiet: raw.quiet === true,
    time: num(raw.time, 0, log, 'clock', 0),
    nodes: list(raw.nodes, timer, log, 'node yield'),
    regrow: list(raw.regrow, timer, log, 'stump timer'),
    mounds: list(raw.mounds, timer, log, 'mound timer'),
    treeTarget: optNum(raw.treeTarget, log, 'tree target', 0),
    hedgeTarget: optNum(raw.hedgeTarget, log, 'hedge target', 0),
    pumpkinTarget: optNum(raw.pumpkinTarget, log, 'pumpkin target', 0),
    chestTarget: optNum(raw.chestTarget, log, 'chest target', 0),
    rockTarget: optNum(raw.rockTarget, log, 'rock target', 0),
    items: list(raw.items, (v: unknown): ItemState | null => reviveItem(v, width, height, log), log, 'ground item'),
    structures: list(raw.structures, structure, log, 'structure'),
    settings: reviveSettings(raw.settings, log),
    worldLevel: num(raw.worldLevel, 0, log, 'world level', 0),
  };
}

/**
 * The structures, checked against the map: an entry on a tile that isn't
 * built any more is dropped, and each kept one is its kind's fresh state
 * (`freshStructure`) with every saved field that's still good on top, so
 * fields added since come in at their defaults. A built tile with no saved
 * state gets a fresh one.
 * @param entries The saved [tile index, state] pairs.
 * @param map The rebuilt map.
 * @param log Where fixes are noted.
 * @returns The structures.
 */
export function reviveStructures(entries: [number, StructureState][], map: WorldMap, log: RepairLog): [number, StructureState][] {
  const out: [number, StructureState][] = [];
  for (const [i, saved] of entries) {
    const kind = map.tileAt(i);
    if (!isStructure(kind)) {
      log.note('dropped a structure whose tile is no longer built');
      continue;
    }
    const raw = saved as unknown as Raw;
    const floor = typeof raw.floor === 'string' && raw.floor in CHAR_BY_TILE && !isStructure(raw.floor as Tile) ? raw.floor as Tile : 'grass';
    const owner = typeof raw.owner === 'string' ? raw.owner : typeof raw.keeper === 'string' ? raw.keeper : null;
    const s = freshStructure(kind, int(raw.level, 0, log, 'structure level', 0), floor, owner);
    s.hp = num(raw.hp, s.hp, log, 'structure hp', 0);
    s.fuel = num(raw.fuel, s.fuel, log, 'structure fuel', 0);
    for (const key of ['queue', 'progress', 'ammo', 'readyAt', 'pumped'] as const) {
      if (raw[key] !== undefined || s[key] !== undefined) {
        s[key] = num(raw[key], s[key] ?? 0, log, `structure ${key}`, 0);
      }
    }
    if (raw.buffer !== undefined || s.buffer) {
      s.buffer = reviveBundle(raw.buffer, log, 'station buffer');
    }
    if (raw.hoard !== undefined || s.hoard) {
      s.hoard = reviveBundle(raw.hoard, log, 'digger hoard');
    }
    if (s.stash) {
      s.stash = reviveSlots(raw.stash, STASH_SLOTS, log);
    }
    if (raw.out !== undefined) {
      s.out = reviveBundle(raw.out, log, 'held output');
    }
    if (s.routes) {
      s.routes = reviveRoutes(raw.routes, log);
    }
    out.push([i, s]);
  }
  const kept = new Set(out.map(([i]): number => i));
  for (let i = 0; i < map.size; i++) {
    const kind = map.tileAt(i);
    if (isStructure(kind) && !kept.has(i)) {
      out.push([i, freshStructure(kind, 0, 'grass')]);
      log.note('gave a built tile with no saved state a fresh one');
    }
  }
  return out;
}

/**
 * A belt sorter's routes: each side kept if it names a side and a thing
 * that still exists.
 * @param v The saved routes.
 * @param log Where fixes are noted.
 * @returns The routes.
 */
function reviveRoutes(v: unknown, log: RepairLog): Partial<Record<SortSide, SortKey>> {
  const out: Partial<Record<SortSide, SortKey>> = {};
  for (const [side, key] of Object.entries(isRaw(v) ? v : {})) {
    if ((SORT_SIDES as string[]).includes(side) && typeof key === 'string' && isSortKey(key)) {
      out[side as SortSide] = key as SortKey;
    } else {
      log.note('dropped a sorter route');
    }
  }
  return out;
}

/**
 * Whether a key names a thing that exists.
 * @param key The key.
 * @returns True for gear, a structure, a material, or candy or blood.
 */
function isSortKey(key: string): boolean {
  const [kind, what] = key.split(':');
  return kind === 'gear' ? what in GEAR : kind === 'build' ? what in STRUCTURES : kind === 'mat' ? (MATERIALS as string[]).includes(what) : kind === 'res' && (RESOURCES as string[]).includes(what);
}

/**
 * One item on the ground, if it's on the map: its goods (any missing as 0)
 * and the bag item it is, if any.
 * @param v The saved item.
 * @param width The map's width.
 * @param height The map's height.
 * @param log Where fixes are noted.
 * @returns The item, or null to drop it.
 */
function reviveItem(v: unknown, width: number, height: number, log: RepairLog): ItemState | null {
  if (!isRaw(v) || typeof v.x !== 'number' || typeof v.y !== 'number' || !(v.x >= 0 && v.y >= 0 && v.x < width && v.y < height)) {
    return null;
  }
  const { id, x, y, held: savedHeld, ...goods } = v;
  const held = savedHeld == null ? null : reviveBagItem(savedHeld, log);
  const bundle = stock(reviveBundle(goods, log, 'ground goods'));
  if (!held && !Object.values(bundle).some((n: number): boolean => n > 0)) {
    return null;
  }
  return { ...bundle, id: int(id, 0, log, 'ground item id', 0), x: x as number, y: y as number, held };
}

/**
 * The map editor's remembered Mix areas: lists of tile indices on the map.
 * @param v The saved areas.
 * @param size Tiles on the map.
 * @param log Where fixes are noted.
 * @returns The areas.
 */
function reviveBlends(v: unknown, size: number, log: RepairLog): Record<string, number[]> {
  const out: Record<string, number[]> = {};
  for (const [key, tiles] of Object.entries(isRaw(v) ? v : {})) {
    if (Array.isArray(tiles)) {
      out[key] = tiles.filter((i: unknown): i is number => typeof i === 'number' && Number.isInteger(i) && i >= 0 && i < size);
    } else {
      log.note('dropped a bad blend area');
    }
  }
  return out;
}

/**
 * The part of the map the TV frames, or null for all of it.
 * @param v The saved view.
 * @param log Where fixes are noted.
 * @returns The view.
 */
function reviveView(v: unknown, log: RepairLog): MapView | null {
  if (v == null) {
    return null;
  }
  if (!isRaw(v) || !['x', 'y', 'w', 'h'].every((k: string): boolean => typeof v[k] === 'number' && Number.isFinite(v[k] as number))) {
    log.note('dropped a bad view');
    return null;
  }
  return { x: v.x as number, y: v.y as number, w: v.w as number, h: v.h as number };
}
