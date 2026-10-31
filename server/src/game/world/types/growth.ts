// Types
import type { GrownTile } from '@halloween/shared/protocol/game-events';

/**
 * Things the map keeps topped up.
 */
export type StockedTile = 'tree' | 'pumpkin' | 'chest';

/**
 * What regrowth keeps topped up to a target: the stocked tiles, plus
 * hedges (which grow back with the trees).
 */
export type RestockedTile = StockedTile | 'hedge' | 'rock';

/**
 * Someone standing somewhere, for keeping regrowth off their tile.
 */
export interface Occupant {
  /**
   * Where they stand across, in tiles.
   */
  x: number;

  /**
   * Where they stand down, in tiles.
   */
  y: number;
}

/**
 * Something that grew this step: its tile and what it became.
 */
export interface GrownSpot {
  /**
   * The tile's column.
   */
  tx: number;

  /**
   * The tile's row.
   */
  ty: number;

  /**
   * What grew there.
   */
  tile: GrownTile;
}

/**
 * Whether someone stands on or beside a tile.
 */
export type Occupied = (tx: number, ty: number) => boolean;
