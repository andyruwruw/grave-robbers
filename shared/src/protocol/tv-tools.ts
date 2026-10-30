// Types
import type { MonsterKind } from '../monsters/monster-kinds';

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
 * What the Game tab can conjure next to a player.
 */
export type SpawnKind = 'tree' | 'pumpkin' | 'chest' | 'rock' | 'loot' | MonsterKind;

/**
 * Everything the Game tab can conjure, in the order it lists them.
 */
export const SPAWN_KINDS: SpawnKind[] = ['tree', 'pumpkin', 'chest', 'rock', 'loot', 'zombie', 'vampire', 'ghost', 'brute', 'skeleton', 'witch', 'ghoul', 'demon'];
