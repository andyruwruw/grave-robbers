// Types
import type { Inventory } from '@halloween/shared/goods/goods';
import type { ItemState } from '@halloween/shared/goods/ground-items';
import type { Gear } from '@halloween/shared/inventory/bag-items';
import type { BlendAreas } from '@halloween/shared/map-editor/blend/blend-areas';
import type { GameSettings } from '@halloween/shared/protocol/game-settings';
import type { MapView } from '@halloween/shared/protocol/tv-tools';
import type { TreeState } from '@halloween/shared/skill-tree/types/skill-tree';
import type { WorldMap } from '@halloween/shared/world/world-map';
import type { StructureState } from '../../world/types/structures';
import type { PLAYER_SAVE_VERSION, WORLD_SAVE_VERSION } from '../config/save';

/**
 * A world slot's `world.json`: everything about the world but its terrain,
 * which is in chunk files (see `chunk-codec.ts`). Players are in their own
 * files (`PlayerSave`); monsters aren't saved.
 */
export interface WorldSave {
  /**
   * The save format (see `WORLD_SAVE_VERSION`).
   */
  version: typeof WORLD_SAVE_VERSION;

  /**
   * The seed the map was generated from.
   */
  seed: number;

  /**
   * Tiles across.
   */
  width: number;

  /**
   * Tiles down.
   */
  height: number;

  /**
   * The tile each number in a chunk file stands for, so the tile list can
   * change without breaking saves.
   */
  palette: string[];

  /**
   * Tiles across a chunk file, when it was written (see `CHUNK_SIZE`).
   */
  chunkSize: number;

  /**
   * The level a 0 byte in a chunk file stands for (see `MIN_LEVEL`).
   */
  minLevel: number;

  /**
   * The map editor's Mix settings remembered per tile; older saves have
   * none.
   */
  blends?: BlendAreas;

  /**
   * The part of the map the TV frames, from the preset (the sandbox).
   */
  view?: MapView | null;

  /**
   * Whether nothing comes on its own, from the preset (the sandbox).
   */
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

  /**
   * How many hedges the map keeps growing back to: as many as it was
   * generated with. Missing from older saves.
   */
  hedgeTarget?: number;

  /**
   * How many pumpkins the map keeps growing back to (the admin can change
   * it). Missing from older saves.
   */
  pumpkinTarget?: number;

  /**
   * How many chests the map keeps growing back to. Missing from older saves.
   */
  chestTarget?: number;

  /**
   * How many rocks the map keeps growing back to. Missing from older saves.
   */
  rockTarget?: number;

  /**
   * Goods and gear lying on the ground.
   */
  items: ItemState[];

  /**
   * Built structures by tile index.
   */
  structures: [number, StructureState][];

  /**
   * The Game tab's switches and the difficulty.
   */
  settings: GameSettings;

  /**
   * The hidden world level (see `LevelSystem.worldLevel`).
   */
  worldLevel: number;
}

/**
 * The single-file save from before world slots (`world.json`, version 8):
 * imported once into the first slot.
 */
export interface LegacyWorldSave extends Omit<WorldSave, 'version' | 'width' | 'height' | 'palette' | 'settings' | 'worldLevel'> {
  /**
   * Always 8.
   */
  version: number;

  /**
   * Every tile (see `WorldMap.encode`).
   */
  tiles: string;

  /**
   * Tiles across; missing means classic size.
   */
  width?: number;

  /**
   * Terrain level of each tile (see `WorldMap.encodeLevels`).
   */
  levels: string;

  /**
   * Turned tiles (see `WorldMap.encodeRamps`).
   */
  ramps?: string;
}

/**
 * A world as read back from its slot: its save and its map.
 */
export interface LoadedWorld {
  /**
   * Everything but the terrain.
   */
  save: WorldSave;

  /**
   * The terrain, rebuilt from the chunks.
   */
  map: WorldMap;

  /**
   * Whether every chunk must be written again on the next save: they were
   * written in another format (tile list, chunk size, lowest level), so
   * keeping some old files beside new ones would scramble them.
   */
  rewrite: boolean;
}

/**
 * One character's file (`players/<id>.json`): who they are, the secret
 * token their phone holds, and everything they had where they were.
 */
export interface PlayerSave {
  /**
   * The save format (see `PLAYER_SAVE_VERSION`).
   */
  version: typeof PLAYER_SAVE_VERSION;

  /**
   * Their id, which also names the file.
   */
  id: string;

  /**
   * The token their phone resumes with.
   */
  token: string;

  /**
   * Their name; no one else may take it (case-insensitive).
   */
  name: string;

  /**
   * Their color.
   */
  color: string;

  /**
   * Where they were (tiles).
   */
  x: number;

  /**
   * Where they were (tiles).
   */
  y: number;

  /**
   * Their health, or 0 if they were dead (they come back at a spawn).
   */
  hp: number;

  /**
   * Candy and blood.
   */
  inventory: Inventory;

  /**
   * The bag and what's equipped.
   */
  bag: Gear;

  /**
   * Their skill tree.
   */
  tree: TreeState;

  /**
   * Seconds online, toward their hidden level.
   */
  onlineSeconds: number;

  /**
   * When they were last saved (ms since the epoch).
   */
  savedAt: number;
}

/**
 * Everything a slot loads: the world, its characters, and whether it was
 * just made (no world yet: one is generated).
 */
export interface LoadedSlot {
  /**
   * The world, or null for a new slot.
   */
  world: LoadedWorld | null;

  /**
   * Every character saved in it.
   */
  players: PlayerSave[];

  /**
   * Ids of characters whose files were repaired on loading (written again
   * on the next save).
   */
  repaired: string[];
}

/**
 * A saved map layout to start new worlds from: the generator's seed and
 * the tiles and terrain it made, fresh (nothing built or dug).
 */
export interface MapPreset {
  /**
   * Its display name (the file name is made from it).
   */
  name: string;

  /**
   * The seed the map was generated from.
   */
  seed: number;

  /**
   * Every tile (see `WorldMap.encode`).
   */
  tiles: string;

  /**
   * Tiles across; missing means classic size.
   */
  width?: number;

  /**
   * Terrain level of each tile (see `WorldMap.encodeLevels`).
   */
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
