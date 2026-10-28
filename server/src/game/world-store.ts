// Packages
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Types
import type { BlendAreas } from '@halloween/shared/blend';
import type { MapView } from '@halloween/shared/protocol';
import type { Bundle, ItemState } from '@halloween/shared/items';
import type { Tile } from '@halloween/shared/world';

/**
 * Live state of a built structure.
 */
export interface StructureState {
  hp: number;

  /**
   * Seconds of fuel left (lights only; 0 otherwise).
   */
  fuel: number;

  /**
   * The tile underneath, restored when the structure breaks.
   */
  floor: Tile;

  /**
   * Batches waiting in a station, and seconds spent on the current one.
   */
  queue?: number;
  progress?: number;

  /**
   * Its builder's skill level for this kind of structure, which sets its
   * health, burn time, spike damage, or working speed. 0 when missing.
   */
  level?: number;

  /**
   * Goods a station has pulled in toward its next batch.
   */
  buffer?: Partial<Bundle>;

  /**
   * Shots a blood sentry has loaded, and when it may fire next.
   */
  ammo?: number;
  readyAt?: number;

  /**
   * The id of the player a coffin belongs to (they rise from it).
   */
  owner?: string;
}

/**
 * Where the world is saved; `WORLD_SAVE` overrides it (e.g. for a second
 * server that shouldn't touch the main save).
 */
const SAVE_PATH = process.env.WORLD_SAVE ?? fileURLToPath(new URL('../../data/world.json', import.meta.url));

/**
 * What survives a server restart. Players and monsters are deliberately
 * left out.
 */
export interface WorldSave {
  version: 8;
  seed: number;
  tiles: string;

  /**
   * Terrain level of each tile (see `WorldMap.encodeLevels`).
   */
  levels: string;

  /**
   * Which way each turned staircase climbs (see `WorldMap.encodeRamps`);
   * older saves have none.
   */
  ramps?: string;

  /**
   * The map editor's Mix settings remembered per tile; older saves have
   * none.
   */
  blends?: BlendAreas;

  /**
   * The part of the map the TV frames, and whether nothing comes on its
   * own, both from the preset (the sandbox).
   */
  view?: MapView | null;
  quiet?: boolean;

  /**
   * Game clock in seconds; it doesn't advance while the server is off.
   */
  time: number;

  /**
   * Remaining yield of partly gathered tiles, by tile index.
   */
  nodes: [number, number][];

  /**
   * When each stump rots away, by tile index (game clock seconds).
   */
  regrow: [number, number][];

  /**
   * When a new gravestone rises from each dug-up mound, by tile index.
   */
  mounds: [number, number][];

  /**
   * How many trees (standing or stumps) the map keeps growing back to: as
   * many as it was generated with. Missing from older saves.
   */
  treeTarget?: number;

  items: ItemState[];

  /**
   * Built structures by tile index.
   */
  structures: [number, StructureState][];
}

/**
 * A saved map layout to start new worlds from: the generator's seed and
 * the tiles and terrain it made, fresh (nothing built or dug).
 */
export interface MapPreset {
  name: string;
  seed: number;
  tiles: string;
  levels: string;

  /**
   * Turned stairs (see `WorldMap.encodeRamps`), from the map editor.
   */
  ramps?: string;

  /**
   * The map editor's Mix settings remembered per tile.
   */
  blends?: BlendAreas;

  /**
   * The part of the map the TV frames, for a map that only uses part of
   * the grid (the sandbox).
   */
  view?: MapView | null;

  /**
   * A test map: worlds started from it begin with natural spawning off
   * (see `GameSettings.spawning`).
   */
  quiet?: boolean;
}

/**
 * Where presets live (`PRESET_DIR` overrides, for tests).
 */
const PRESET_DIR = process.env.PRESET_DIR ?? fileURLToPath(new URL('../../presets/', import.meta.url));

/**
 * The preset new worlds start from unless the TV picks another (or a
 * random map): `WORLD_PRESET`, else `graveyard`. Ignored if that file is
 * missing.
 */
export const DEFAULT_PRESET = process.env.WORLD_PRESET ?? 'king-of-the-hill';

/**
 * Every preset in `server/presets/`, by file name.
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
 * preset with the same name), for the TV's map editor. Returns its id.
 */
export function savePreset(preset: MapPreset): string {
  const id = preset.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'map';
  mkdirSync(PRESET_DIR, { recursive: true });
  writeFileSync(join(PRESET_DIR, `${id}.json`), JSON.stringify(preset, null, 2));
  return id;
}

/**
 * Reads a preset by file name, or null if it's missing or unreadable.
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

/**
 * Reads the saved world, or null if there is none or it can't be parsed.
 */
export function loadWorld(): WorldSave | null {
  if (!existsSync(SAVE_PATH)) {
    return null;
  }
  try {
    const save = JSON.parse(readFileSync(SAVE_PATH, 'utf8')) as WorldSave;
    return save.version === 8 ? save : null;
  } catch (err) {
    console.error('[world] unreadable save, starting fresh', err);
    return null;
  }
}

/**
 * Writes the world atomically (temp file, then rename).
 */
export function saveWorld(save: WorldSave): void {
  mkdirSync(dirname(SAVE_PATH), { recursive: true });
  const tmp = `${SAVE_PATH}.tmp`;
  writeFileSync(tmp, JSON.stringify(save));
  renameSync(tmp, SAVE_PATH);
}
