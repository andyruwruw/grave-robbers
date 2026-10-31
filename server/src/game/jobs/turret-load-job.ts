// Packages
import { stock } from '@halloween/shared/goods/goods';
import { isStructure } from '@halloween/shared/structures/structure-catalog';
import { TURRETS } from '@halloween/shared/structures/turrets';

// Local Imports
import { TileJob } from './tile-job';

// Types
import type { Tile } from '@halloween/shared/world/tiles';
import type { Player } from '../players/player';

/**
 * A turret with room for ammo the player carries, on USE: it loads one. Falls
 * through to the other jobs when it doesn't load.
 */
export class TurretLoadJob extends TileJob {
  /**
   * Loads ammo into a turret, when they carry it and it has room.
   * @param p The player.
   * @param tx The tile's column.
   * @param ty The tile's row.
   * @param tile What the tile is.
   * @param chop How many hits the hammer's swing counts for.
   * @returns Whether this job took the swing.
   */
  tryStrike(p: Player, tx: number, ty: number, tile: Tile, chop: number): boolean {
    const turret = isStructure(tile) ? TURRETS[tile] : undefined;
    if (turret?.ammo && p.canPay(stock({ [turret.ammo]: 1 })) && this.world.turretAmmo.load(tx, ty)) {
      this._game.bag.pay(p, stock({ [turret.ammo]: 1 }));
      this.outbox.inventoryChanged.add(p.token);
      this.outbox.sound(p, 'refuel');
      return true;
    }
    return false;
  }
}
