// Local Imports
import { GEAR, GEAR_KINDS } from '../gear/gear-catalog';
import { MATERIALS, RESOURCES } from '../goods/goods';
import { MONSTER_KINDS } from '../monsters/monster-kinds';
import { STRUCTURE_KINDS } from '../structures/structure-catalog';

// Types
import type { GearKind } from '../gear/types/gear-def';
import type { Material, Resource } from '../goods/goods';
import type { ItemKey } from '../inventory/item-keys';
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

/**
 * What the admin's Give page hands a player: candy or blood, a material,
 * a piece of gear, or a structure to place.
 */
export type GiveKind = `res:${Resource}` | ItemKey;

/**
 * Everything the Give page lists, in its order (no infused-only gear).
 */
export const GIVE_KINDS: GiveKind[] = [
  ...RESOURCES.map((r: Resource): GiveKind => `res:${r}`),
  ...MATERIALS.map((m: Material): GiveKind => `mat:${m}`),
  ...GEAR_KINDS.filter((k: GearKind): boolean => !GEAR[k].infused).map((k: GearKind): GiveKind => `gear:${k}`),
  ...STRUCTURE_KINDS.map((k: StructureKind): GiveKind => `build:${k}`),
];

/**
 * Most of one thing a single give hands over.
 */
export const GIVE_MAX = 999;

/**
 * Most gear a single give hands over (each piece is its own bag slot, and
 * what doesn't fit drops on the ground).
 */
export const GIVE_GEAR_MAX = 20;
