// Packages
import { altarBlood } from '@halloween/shared/skill-tree/upgrades/structure-upgrades';
import { WORKING_GLOW } from '@halloween/shared/structures/lights';
import { ALTAR_HP_COST } from '@halloween/shared/structures/occult';

// Local Imports
import { TileJob } from './tile-job';

// Types
import type { Tile } from '@halloween/shared/world/tiles';
import type { Player } from '../players/player';

/**
 * An altar: the player bleeds on it for blood.
 */
export class AltarJob extends TileJob {
  /**
   * Bleeds the player on an altar.
   * @param p The player.
   * @param tx The tile's column.
   * @param ty The tile's row.
   * @param tile What the tile is.
   * @param chop How many hits the hammer's swing counts for.
   * @returns Whether this job took the swing.
   */
  tryStrike(p: Player, tx: number, ty: number, tile: Tile, chop: number): boolean {
    if (tile === 'altar') {
      this.offer(p, tx, ty);
      return true;
    }
    return false;
  }

  /**
   * Bleeds a player on an altar: it takes some health (never their last)
   * and gives blood, more from an altar built by someone further up the
   * tree, and the altar glows for a while.
   * @param p The player.
   * @param tx The tile's column.
   * @param ty The tile's row.
   */
  private offer(p: Player, tx: number, ty: number): void {
    if (p.hp <= ALTAR_HP_COST) {
      this.outbox.sound(p, 'error');
      return;
    }
    p.hp -= ALTAR_HP_COST;
    p.hurts++;
    const blood = altarBlood(this.world.structureQueries.level(tx, ty));
    this._game.bag.take(p, 'blood', blood);
    this.outbox.events.push({ t: 'pickup', x: p.x, y: p.y, goods: 'blood' });
    this.world.lights.kindle(tx, ty, WORKING_GLOW);
    this.outbox.events.push({ t: 'chips', tx, ty, chip: 'stone', health: this.world.resources.health(tx, ty) });
    this.outbox.sound(p, 'unlock');
  }
}
