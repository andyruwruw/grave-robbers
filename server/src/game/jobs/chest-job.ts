// Packages
import { playerLevel } from '@halloween/shared/difficulty/player-level';

// Local Imports
import { rollChest } from '../helpers/loot-rolls';
import { TileJob } from './tile-job';

// Types
import type { Tile } from '@halloween/shared/world/tiles';
import type { Player } from '../players/player';

/**
 * A chest: it breaks open in one hit, or on USE.
 */
export class ChestJob extends TileJob {
  /**
   * Breaks a chest open.
   * @param p The player.
   * @param tx The tile's column.
   * @param ty The tile's row.
   * @param tile What the tile is.
   * @param chop How many hits the hammer's swing counts for.
   * @returns Whether this job took the swing.
   */
  tryStrike(p: Player, tx: number, ty: number, tile: Tile, chop: number): boolean {
    if (tile === 'chest') {
      this.world.resources.openChest(tx, ty);
      this.spillChest(p, tx, ty);
      this.outbox.events.push({ t: 'smash', tx, ty, tile, broke: true, health: 0 });
      this.outbox.sound(p, 'break');
      return true;
    }
    return false;
  }

  /**
   * Gives what was in a chest: raw goods, a little better for a stronger
   * opener (see CHEST_LOOT).
   * @param p The player.
   * @param tx The tile's column.
   * @param ty The tile's row.
   */
  private spillChest(p: Player, tx: number, ty: number): void {
    this._game.pickups.award(p, rollChest(playerLevel(p.bag, p.tree, p.onlineSeconds).total), tx + 0.5, ty + 0.5);
  }
}
