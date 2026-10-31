// Local Imports
import { chunkKeyOf, chunkKeys } from './helpers/chunk-codec';

// Types
import type { WorldMap } from '@halloween/shared/world/world-map';

/**
 * Which chunks of a map changed since its last save, so a save writes only
 * those: a dug grave or a raised hill costs one small file, however big
 * the world is.
 */
export class ChunkTracker {
  /**
   * The map watched.
   */
  private readonly _map: WorldMap;

  /**
   * Keys of the chunks changed since the last `take`.
   */
  private _dirty = new Set<string>();

  /**
   * Starts watching a map.
   * @param map The map.
   * @param saved Whether it was just read from its save (else every chunk
   *   needs writing).
   */
  constructor(map: WorldMap, saved: boolean) {
    this._map = map;
    map.watch((i: number): void => {
      this._dirty.add(chunkKeyOf(i, map.width));
    });
    if (!saved) {
      this.markAll();
    }
  }

  /**
   * Marks every chunk changed (a whole new map, or a save that failed).
   */
  markAll(): void {
    this._dirty = new Set(chunkKeys(this._map.width, this._map.height));
  }

  /**
   * Marks chunks changed again (after a save of them failed).
   * @param keys The chunks.
   */
  mark(keys: Iterable<string>): void {
    for (const key of keys) {
      this._dirty.add(key);
    }
  }

  /**
   * Returns and clears the changed chunks.
   * @returns Their keys.
   */
  take(): string[] {
    const keys = [...this._dirty];
    this._dirty.clear();
    return keys;
  }
}
