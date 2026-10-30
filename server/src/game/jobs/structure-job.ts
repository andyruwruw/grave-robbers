// Packages
import { WORKING_GLOW } from '@halloween/shared/structures/lights';
import { STRUCTURES, SWING_DAMAGE, isStructure } from '@halloween/shared/structures/structure-catalog';

// Local Imports
import { STONE_STRUCTURES } from './config/jobs';
import { TileJob } from './tile-job';

// Types
import type { Bundle } from '@halloween/shared/goods/goods';
import type { Tile } from '@halloween/shared/world/tiles';
import type { Player } from '../players/player';

/**
 * Any other structure: feeds or relights it, picks up a light, or
 * damages it.
 */
export class StructureJob extends TileJob {
  /**
   * Feeds, relights, picks up, or damages a structure.
   * @param p The player.
   * @param tx The tile's column.
   * @param ty The tile's row.
   * @param tile What the tile is.
   * @param chop How many hits the hammer's swing counts for.
   * @returns Whether this job took the swing.
   */
  tryStrike(p: Player, tx: number, ty: number, tile: Tile, chop: number): boolean {
    if (isStructure(tile)) {
      if (this.world.stations.feed(tx, ty, (cost: Bundle): boolean => this._game.bag.pay(p, cost))) {
        this.outbox.inventoryChanged.add(p.token);
        this.outbox.sound(p, 'refuel');
        return true;
      }
      if (this.world.lights.relight(tx, ty)) {
        this.outbox.sound(p, 'refuel');
        return true;
      }
      if (STRUCTURES[tile].light && STRUCTURES[tile].light!.burn !== WORKING_GLOW) {
        this.world.structureDamage.damage(tx, ty, Infinity);
        this._game.pickups.pocket(p, { build: tile, count: 1 }, tx + 0.5, ty + 0.5);
        p.protectedUntil = 0;
        this.outbox.sound(p, 'break');
        this.outbox.events.push({ t: 'chips', tx, ty, chip: 'wood', health: 0 });
        return true;
      }
      this.world.structureDamage.damage(tx, ty, SWING_DAMAGE * chop);
      p.protectedUntil = 0;
      if (this.world.structureQueries.hp(tx, ty) === null) {
        this._game.pickups.pocket(p, { build: tile === 'sprout' ? 'seeds' : tile, count: 1 }, tx + 0.5, ty + 0.5);
      }
      const chip = STONE_STRUCTURES.has(tile) ? 'stone' : 'wood';
      this.outbox.sound(p, chip === 'stone' ? 'mine' : 'chop');
      this.outbox.events.push({ t: 'chips', tx, ty, chip, health: this.world.resources.health(tx, ty) });
      return true;
    }
    return false;
  }
}
