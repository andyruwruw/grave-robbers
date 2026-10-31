// Local Imports
import { TileJob } from './tile-job';

// Types
import type { Tile } from '@halloween/shared/world/tiles';
import type { Player } from '../players/player';

/**
 * A storage chest: a swing never breaks it (its keeper opens it with USE,
 * see `UseSystem`, and picks it up from there once it's empty).
 */
export class StashJob extends TileJob {
  /**
   * A swing on a storage chest does nothing but buzz.
   * @param p The player.
   * @param tx The tile's column.
   * @param ty The tile's row.
   * @param tile What the tile is.
   * @param chop How many hits the hammer's swing counts for.
   * @returns Whether this job took the swing.
   */
  tryStrike(p: Player, tx: number, ty: number, tile: Tile, chop: number): boolean {
    if (tile === 'stash') {
      this.outbox.sound(p, 'error');
      return true;
    }
    return false;
  }
}
