// Types
import type { BlendAreas } from '@halloween/shared/map-editor/blend/blend-areas';
import type { MapView } from '@halloween/shared/protocol/tv-tools';
import type { ItemState } from '@halloween/shared/goods/ground-items';
import type { StructureState } from '../../world/types/structures';
import type { WORLD_SAVE_VERSION } from '../config/save';

/**
 * What survives a server restart. Players and monsters are deliberately
 * left out.
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
   * Every tile (see `WorldMap.encode`).
   */
  tiles: string;

  /**
   * Tiles across (the height follows from `tiles`); missing in older saves,
   * which are classic size.
   */
  width?: number;

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
   * Goods and gear lying on the ground.
   */
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
