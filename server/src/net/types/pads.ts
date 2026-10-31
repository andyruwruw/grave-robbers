// Types
import type { WebSocket } from 'ws';

/**
 * A pad's press counters, last relayed: each one changing means a press.
 */
export interface PadPresses {
  /**
   * USE presses.
   */
  use: number;

  /**
   * Panic presses.
   */
  panic: number;

  /**
   * Bag menu presses.
   */
  bag: number;

  /**
   * Craft menu presses.
   */
  craft: number;

  /**
   * Skill tree menu presses.
   */
  tree: number;

  /**
   * Quarter turns left.
   */
  turnLeft: number;

  /**
   * Quarter turns right.
   */
  turnRight: number;
}

/**
 * A game controller plugged into a TV page.
 */
export interface Pad {
  /**
   * The TV page it's plugged into.
   */
  tv: WebSocket;

  /**
   * Its index on that TV page.
   */
  index: number;

  /**
   * Its name, as the browser reports it.
   */
  name: string;

  /**
   * The token of the player who claimed it, if any.
   */
  token: string | null;

  /**
   * The press counters last relayed.
   */
  presses: PadPresses;

  /**
   * Whether action was held last relay.
   */
  act: boolean;
}
