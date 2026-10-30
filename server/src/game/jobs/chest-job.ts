// Packages
import { stock } from '@halloween/shared/goods/goods';

// Local Imports
import { NO_TREE } from '../config/loot';
import { randomLoot } from '../helpers/loot-rolls';
import { CHEST_BOLTS, CHEST_BOLT_CHANCE, CHEST_CANDY, CHEST_WOOD } from './config/jobs';
import { TileJob } from './tile-job';

// Types
import type { Tile } from '@halloween/shared/world/tiles';
import type { Player } from '../players/player';

/**
 * A chest: it breaks open in one hit.
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
   * Scatters a chest's contents over its tile: a piece of gear and a pile
   * of resources.
   * @param p The player.
   * @param tx The tile's column.
   * @param ty The tile's row.
   */
  private spillChest(p: Player, tx: number, ty: number): void {
    const roll = (most: number): number => 1 + Math.floor(Math.random() * most);
    this._game.pickups.award(p, stock({
      wood: roll(CHEST_WOOD),
      candy: roll(CHEST_CANDY),
      bolts: Math.random() < CHEST_BOLT_CHANCE ? roll(CHEST_BOLTS) : 0,
    }), tx + 0.35, ty + 0.5);
    this._game.pickups.pocket(p, randomLoot(NO_TREE), tx + 0.65, ty + 0.5);
  }
}
