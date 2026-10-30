// Local Imports
import { SoundWatcher } from './sound-watcher';

// Types
import type { Seen } from '../../types/sound';

/**
 * A watcher that keeps what it last saw of each player or monster, to
 * spot what changed between snapshots.
 */
export abstract class EntityWatcher<Id> extends SoundWatcher {
  /**
   * What was last seen of each one still around.
   */
  protected readonly _seen = new Map<Id, Seen>();

  /**
   * Forgets the ones that are gone.
   *
   * @param live - The ids in this snapshot.
   */
  protected prune(live: Set<Id>): void {
    for (const id of this._seen.keys()) {
      if (!live.has(id)) {
        this._seen.delete(id);
      }
    }
  }
}
