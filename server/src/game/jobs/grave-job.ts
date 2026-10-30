// Packages
import { stock } from '@halloween/shared/goods/goods';
import {
  DIG_BLUEPRINT_CHANCE,
  DIG_BONES,
  DIG_BONE_CHANCE,
  DIG_CANDY,
  DIG_WOOD,
  DIG_WOOD_CHANCE,
} from '@halloween/shared/loot/graves';

// Local Imports
import { DiggingJob } from './digging-job';

// Types
import type { Tile } from '@halloween/shared/world/tiles';
import type { Player } from '../players/player';

/**
 * A tombstone or cross: digging up the grave.
 */
export class GraveJob extends DiggingJob {
  /**
   * Digs at a grave.
   * @param p The player.
   * @param tx The tile's column.
   * @param ty The tile's row.
   * @param tile What the tile is.
   * @param chop How many hits the hammer's swing counts for.
   * @returns Whether this job took the swing.
   */
  tryStrike(p: Player, tx: number, ty: number, tile: Tile, chop: number): boolean {
    if (tile === 'tombstone' || tile === 'cross') {
      this.dig(p, tx, ty, tile, chop);
      return true;
    }
    return false;
  }

  /**
   * Digs at a grave, `hits` times. Once it's dug up the stone sinks away
   * and the grave gives up candy, maybe wood, maybe a piece of gear, and
   * maybe a blueprint, which unlocks a node of the digger's skill tree.
   * @param p The player.
   * @param tx The tile's column.
   * @param ty The tile's row.
   * @param tile What the tile is.
   * @param hits How many hits the swing counts for.
   */
  private dig(p: Player, tx: number, ty: number, tile: 'tombstone' | 'cross', hits: number): void {
    let done = false;
    for (let i = 0; i < hits && !done; i++) {
      done = this.world.resources.dig(tx, ty);
    }
    this.outbox.events.push({ t: 'dig', tx, ty, tile, done, health: this.world.resources.health(tx, ty) });
    this.outbox.sound(p, done ? 'break' : 'dig');
    this._game.damage.wear(p, 'weapon');
    if (!done) {
      return;
    }
    this._game.pickups.award(p, stock({
      wood: Math.random() < DIG_WOOD_CHANCE ? this.roll(DIG_WOOD) : 0,
      bone: Math.random() < DIG_BONE_CHANCE ? this.roll(DIG_BONES) : 0,
      candy: this.roll(DIG_CANDY),
    }), tx + 0.4, ty + 0.55);
    this.findBlueprint(p, DIG_BLUEPRINT_CHANCE);
  }
}
