// Local Imports
import { GEAR, GEAR_KINDS } from '../gear/gear-catalog';
import { MONSTER_KINDS } from '../monsters/monster-kinds';
import { STRUCTURE_KINDS } from '../structures/structure-catalog';

// Types
import type { GearKind } from '../gear/types/gear-def';
import type { MonsterKind } from '../monsters/monster-kinds';
import type { StructureKind } from '../structures/types/structures';

/**
 * Something on the map the TV's mouse can pick up.
 */
export type LiftTarget =
  /**
   * A player, by public id.
   */
  | { kind: 'player'; id: string }
  /**
   * A monster, by id.
   */
  | { kind: 'monster'; id: number };

/**
 * The part of the map the TV frames (tiles), for a map that only uses
 * part of the grid (the sandbox), or null for the whole map.
 */
export interface MapView {
  /**
   * Left edge, in tiles.
   */
  x: number;

  /**
   * Top edge, in tiles.
   */
  y: number;

  /**
   * Width, in tiles.
   */
  w: number;

  /**
   * Height, in tiles.
   */
  h: number;
}

/**
 * The map tiles the Game tab can conjure.
 */
export type SpawnTile = 'tree' | 'pumpkin' | 'chest' | 'rock';

/**
 * What the Game tab can conjure: a tile, a random piece of loot, a
 * monster, a piece of gear on the ground, or a structure (built at level
 * 0, by no one).
 */
export type SpawnKind = SpawnTile | 'loot' | MonsterKind | `gear:${GearKind}` | `build:${StructureKind}`;

/**
 * The tiles the Game tab can conjure, in the order it lists them.
 */
export const SPAWN_TILES: SpawnTile[] = ['tree', 'pumpkin', 'chest', 'rock'];

/**
 * Everything the Game tab can conjure, in the order it lists them (no
 * infused-only gear: that's only made by infusing).
 */
export const SPAWN_KINDS: SpawnKind[] = [
  ...SPAWN_TILES,
  'loot',
  ...MONSTER_KINDS,
  ...GEAR_KINDS.filter((k: GearKind): boolean => !GEAR[k].infused).map((k: GearKind): SpawnKind => `gear:${k}`),
  ...STRUCTURE_KINDS.map((k: StructureKind): SpawnKind => `build:${k}`),
];
