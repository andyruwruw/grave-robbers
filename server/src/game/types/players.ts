// Types
import type { Gear } from '@halloween/shared/inventory/bag-items';
import type { Inventory } from '@halloween/shared/goods/goods';
import type { PlayerIdentity } from '@halloween/shared/protocol/state/player-state';
import type { TreeState } from '@halloween/shared/skill-tree/types/skill-tree';

/**
 * What a phone shows of its own player's belongings, their skill tree,
 * what a research table in reach takes off upgrades (0 without one), and
 * the level of the anvil in reach (null without one).
 */
export interface Carried {
  /**
   * Candy and blood.
   */
  inventory: Inventory;

  /**
   * The bag and what's equipped.
   */
  gear: Gear;

  /**
   * Their skill tree, with the Game tab's testing switches applied.
   */
  tree: TreeState;

  /**
   * What a research table in reach takes off upgrades (0 without one).
   */
  research: number;

  /**
   * The level of the anvil in reach (null without one).
   */
  anvil: number | null;
}

/**
 * Result of a join attempt.
 */
export type JoinResult =
  /**
   * They joined, as this identity.
   */
  | { ok: true; identity: PlayerIdentity }
  /**
   * They didn't, and why.
   */
  | { ok: false; error: string };

/**
 * What a player who left keeps for when someone joins again under the
 * same name.
 */
export interface Departed {
  /**
   * Their public id, so their coffin stays theirs.
   */
  id: string;

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
   * Seconds their phone was connected, toward their hidden level.
   */
  onlineSeconds: number;
}

/**
 * What a new player is made from.
 */
export interface PlayerInit {
  /**
   * Stable public id (kept from `back` when they return).
   */
  id: string;

  /**
   * Secret token the phone keeps.
   */
  token: string;

  /**
   * Display name.
   */
  name: string;

  /**
   * Body color, one of PLAYER_COLORS.
   */
  color: string;

  /**
   * Where they spawn (tiles).
   */
  x: number;

  /**
   * Where they spawn (tiles).
   */
  y: number;

  /**
   * The game clock when they join (seconds).
   */
  time: number;

  /**
   * What they kept from last time they played under this name, if any.
   */
  back?: Departed;
}
