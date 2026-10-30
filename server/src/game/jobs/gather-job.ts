// Packages
import { stock } from '@halloween/shared/goods/goods';
import { GATHERABLE } from '@halloween/shared/loot/gathering';

// Local Imports
import { TileJob } from './tile-job';

// Types
import type { Tile } from '@halloween/shared/world/tiles';
import type { Player } from '../players/player';

/**
 * A node to gather (a tree, a rock, ...).
 */
export class GatherJob extends TileJob {
  /**
   * Gathers a node (a tree, a rock, ...).
   * @param p The player.
   * @param tx The tile's column.
   * @param ty The tile's row.
   * @param tile What the tile is.
   * @param chop How many hits the hammer's swing counts for.
   * @returns Whether this job took the swing.
   */
  tryStrike(p: Player, tx: number, ty: number, tile: Tile, chop: number): boolean {
    const g = GATHERABLE[tile];
    if (!g) {
      return false;
    }
    let broke = false;
    for (let i = 0; i < chop && !broke; i++) {
      broke = this.world.resources.gather(tx, ty);
    }
    const resource = g.resource;
    if (broke && resource) {
      const taken = this._game.bag.take(p, resource, g.amount);
      if (taken > 0) {
        this.outbox.events.push({ t: 'pickup', x: p.x, y: p.y, goods: resource });
      }
      if (taken < g.amount) {
        this.world.items.addItem(tx + 0.5, ty + 0.5, stock({ [resource]: g.amount - taken }), null);
      }
    }
    this.outbox.sound(p, resource === 'wood' ? 'chop' : 'mine');
    this.outbox.events.push({ t: 'chips', tx, ty, chip: resource === 'wood' ? 'wood' : 'stone', health: this.world.resources.health(tx, ty) });
    return true;
  }
}
