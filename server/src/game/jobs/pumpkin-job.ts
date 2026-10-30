// Packages
import { stock } from '@halloween/shared/goods/goods';
import { PUMPKIN_LOOT_CHANCE } from '@halloween/shared/loot/found-gear';
import { PUMPKIN_SEEDS } from '@halloween/shared/loot/pumpkins';

// Local Imports
import { NO_TREE } from '../config/loot';
import { randomLoot } from '../helpers/loot-rolls';
import { TileJob } from './tile-job';

// Types
import type { Tile } from '@halloween/shared/world/tiles';
import type { Player } from '../players/player';

/**
 * A pumpkin: smashing it gives the pumpkin, seeds, and maybe loot.
 */
export class PumpkinJob extends TileJob {
  /**
   * Smashes a pumpkin: seeds, the pumpkin, maybe loot.
   * @param p The player.
   * @param tx The tile's column.
   * @param ty The tile's row.
   * @param tile What the tile is.
   * @param chop How many hits the hammer's swing counts for.
   * @returns Whether this job took the swing.
   */
  tryStrike(p: Player, tx: number, ty: number, tile: Tile, chop: number): boolean {
    if (tile === 'pumpkin') {
      const broke = this.world.resources.hitPumpkin(tx, ty);
      if (broke) {
        this._game.pickups.award(p, stock({ pumpkin: 1 }), tx + 0.5, ty + 0.5);
        this._game.pickups.pocket(p, { build: 'seeds', count: PUMPKIN_SEEDS[0] + Math.floor(Math.random() * (PUMPKIN_SEEDS[1] - PUMPKIN_SEEDS[0] + 1)) }, tx + 0.5, ty + 0.5);
      }
      if (broke && Math.random() < PUMPKIN_LOOT_CHANCE) {
        this._game.pickups.pocket(p, randomLoot(NO_TREE), tx + 0.5, ty + 0.5);
      }
      this.outbox.events.push({ t: 'smash', tx, ty, tile, broke, health: this.world.resources.health(tx, ty) });
      this.outbox.sound(p, broke ? 'break' : 'hit');
      return true;
    }
    return false;
  }
}
