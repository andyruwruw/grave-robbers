// Local Imports
import { TileJob } from './tile-job';

// Types
import type { Tile } from '@halloween/shared/world/tiles';
import type { Player } from '../players/player';

/**
 * A lamp: it breaks into a lantern.
 */
export class LampJob extends TileJob {
  /**
   * Breaks a lamp into a lantern.
   * @param p The player.
   * @param tx The tile's column.
   * @param ty The tile's row.
   * @param tile What the tile is.
   * @param chop How many hits the hammer's swing counts for.
   * @returns Whether this job took the swing.
   */
  tryStrike(p: Player, tx: number, ty: number, tile: Tile, chop: number): boolean {
    if (tile === 'lamp') {
      this.world.resources.breakLamp(tx, ty);
      this._game.pickups.pocket(p, { build: 'lantern', count: 1 }, tx + 0.5, ty + 0.5);
      this.outbox.sound(p, 'break');
      this.outbox.events.push({ t: 'chips', tx, ty, chip: 'stone', health: 0 });
      return true;
    }
    return false;
  }
}
