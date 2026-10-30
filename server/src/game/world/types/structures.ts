// Types
import type { BagItem } from '@halloween/shared/inventory/bag-items';
import type { Bundle } from '@halloween/shared/goods/goods';
import type { StructureKind } from '@halloween/shared/structures/types/structures';
import type { Tile } from '@halloween/shared/world/tiles';

/**
 * Live state of a built structure.
 */
export interface StructureState {
  /**
   * Health left; it breaks at 0.
   */
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
   * Batches waiting in a station.
   */
  queue?: number;

  /**
   * Seconds a station has spent on its current batch.
   */
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
   * Shots a blood sentry has loaded.
   */
  ammo?: number;

  /**
   * When a blood sentry may fire next.
   */
  readyAt?: number;

  /**
   * Blood a fountain has drained but not yet pumped out (under one).
   */
  pumped?: number;

  /**
   * The id of the player a coffin belongs to (they rise from it).
   */
  owner?: string;

  /**
   * A storage chest's slots.
   */
  stash?: (BagItem | null)[];

  /**
   * A storage chest builder's name (lowercase), the only one who can open
   * it. By name so it survives a restart.
   */
  keeper?: string;
}

/**
 * What a broken storage chest held, waiting for `Game` to leave it on the
 * ground for its keeper.
 */
export interface SpilledStash {
  /**
   * Where the chest stood across (its middle), in tiles.
   */
  x: number;

  /**
   * Where the chest stood down (its middle), in tiles.
   */
  y: number;

  /**
   * The chest builder's name (lowercase).
   */
  keeper: string;

  /**
   * What was inside.
   */
  items: BagItem[];
}

/**
 * A storage chest's slots and keeper.
 */
export interface StashView {
  /**
   * The chest builder's name (lowercase).
   */
  keeper: string;

  /**
   * The chest's slots, live.
   */
  items: (BagItem | null)[];
}

/**
 * A turret ready to act.
 */
export interface ReadyTurret {
  /**
   * The turret's tile column.
   */
  tx: number;

  /**
   * The turret's tile row.
   */
  ty: number;

  /**
   * What kind of turret it is.
   */
  kind: StructureKind;

  /**
   * Its builder's skill level for it.
   */
  level: number;

  /**
   * Spends a shot and sets when it may act again.
   */
  fire: () => void;
}

/**
 * A grave a bone digger dug, for the TV's dirt.
 */
export interface DugGrave {
  /**
   * The grave's tile column.
   */
  tx: number;

  /**
   * The grave's tile row.
   */
  ty: number;

  /**
   * The gravestone it stood under.
   */
  tile: 'tombstone' | 'cross';
}

/**
 * A tile, by column and row.
 */
export interface TilePoint {
  /**
   * The tile's column.
   */
  tx: number;

  /**
   * The tile's row.
   */
  ty: number;
}
