// Packages
import { isStructure } from '@halloween/shared/structures/structure-catalog';

// Local Imports
import { SoundWatcher } from './sound-watcher';

// Types
import type { TileChange } from '@halloween/shared/world/tiles';

/**
 * Sounds for tile changes: a structure going up or coming down. Keeps the
 * stage's map current with them.
 */
export class TileSounds extends SoundWatcher {
  /**
   * Snapshots play nothing here; tiles come in their own message.
   */
  onState(): void {}

  /**
   * Plays builds and breaks, then applies the changes to the map.
   *
   * @param changes - The changed tiles.
   */
  onTiles(changes: TileChange[]): void {
    const map = this._stage.map;
    if (!map) {
      return;
    }
    for (const c of changes) {
      const tx = c.i % map.width;
      const before = map.get(tx, Math.floor(c.i / map.width));
      if (isStructure(c.tile) && !isStructure(before)) {
        this._stage.play('build', tx + 0.5);
      } else if (isStructure(before) && !isStructure(c.tile)) {
        this._stage.play('break', tx + 0.5);
      }
    }
    map.apply(changes);
  }
}
