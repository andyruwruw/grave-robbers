// Packages
import { stock } from '@halloween/shared/goods/goods';
import { WATER_BLOOD } from '@halloween/shared/loot/pumpkins';

// Local Imports
import { TileJob } from './tile-job';

// Types
import type { Tile } from '@halloween/shared/world/tiles';
import type { Player } from '../players/player';

/**
 * Seeds or a sprout, on USE with a watering can in the bag: blood makes
 * them grow.
 */
export class WateringJob extends TileJob {
  /**
   * Waters seeds or a sprout with blood from a watering can.
   * @param p The player.
   * @param tx The tile's column.
   * @param ty The tile's row.
   * @param tile What the tile is.
   * @param chop How many hits the hammer's swing counts for.
   * @returns Whether this job took the swing.
   */
  tryStrike(p: Player, tx: number, ty: number, tile: Tile, chop: number): boolean {
    if ((tile === 'seeds' || tile === 'sprout') && p.count('watering-can') > 0) {
      const grew = p.inventory.blood >= WATER_BLOOD ? this.world.gardens.water(tx, ty) : false;
      if (grew === true) {
        this._game.bag.pay(p, stock({ blood: WATER_BLOOD }));
        this.outbox.inventoryChanged.add(p.token);
        if (this.world.map.get(tx, ty) === 'pumpkin') {
          this.outbox.events.push({ t: 'grow', tx, ty, tile: 'pumpkin' });
        }
      }
      this.outbox.sound(p, grew === true ? 'refuel' : 'error');
      return true;
    }
    return false;
  }
}
