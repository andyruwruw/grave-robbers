// Local Imports
import { TileJob } from './tile-job';

// Types
import type { Tile } from '@halloween/shared/world/tiles';
import type { Player } from '../players/player';

/**
 * A storage chest: its keeper opens it on their phone.
 */
export class StashJob extends TileJob {
  /**
   * Opens the player's own storage chest on their phone.
   * @param p The player.
   * @param tx The tile's column.
   * @param ty The tile's row.
   * @param tile What the tile is.
   * @param chop How many hits the hammer's swing counts for.
   * @returns Whether this job took the swing.
   */
  tryStrike(p: Player, tx: number, ty: number, tile: Tile, chop: number): boolean {
    if (tile === 'stash') {
      if (this.world.structureDamage.stashAt(tx, ty)?.keeper === p.name.toLowerCase()) {
        p.stashAt = { tx, ty };
        this.outbox.stashChanged.add(p.token);
        this.outbox.sound(p, 'equip');
      } else {
        this.outbox.sound(p, 'error');
      }
      return true;
    }
    return false;
  }
}
