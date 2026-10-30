// Types
import type { WorldSave } from '../../storage/types/save';

/**
 * Per-tile counters and timers for the map's natural features, by tile
 * index.
 */
export class TileTimers {
  /**
   * Hits left on a partly gathered, dug, or robbed tile (saved).
   */
  readonly nodes: Map<number, number>;

  /**
   * When each stump rots away (saved).
   */
  readonly regrow: Map<number, number>;

  /**
   * When a new gravestone rises from each mound (saved).
   */
  readonly mounds: Map<number, number>;

  /**
   * Until when each robbed landmark tile has nothing left (in memory only).
   */
  readonly robbed = new Map<number, number>();

  /**
   * Starts the timers, from a save if there is one.
   * @param save The save to start from, or null for none.
   */
  constructor(save: WorldSave | null) {
    this.nodes = new Map(save?.nodes);
    this.regrow = new Map(save?.regrow);
    this.mounds = new Map(save?.mounds);
  }

  /**
   * Forgets every counter and timer on a tile.
   * @param i The tile index.
   */
  forget(i: number): void {
    this.nodes.delete(i);
    this.mounds.delete(i);
    this.regrow.delete(i);
    this.robbed.delete(i);
  }
}
