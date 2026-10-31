// Packages
import { ALTAR_AWAKE_SECONDS, ALTAR_HP_COST } from '@halloween/shared/structures/occult';

// Local Imports
import { TileJob } from './tile-job';

// Types
import type { Tile } from '@halloween/shared/world/tiles';
import type { Player } from '../players/player';

/**
 * A sleeping altar, on USE: the player bleeds on it to wake it.
 */
export class AltarJob extends TileJob {
  /**
   * Bleeds the player on a sleeping altar (an awake one is left to the
   * structure job, so swings at it break it down).
   * @param p The player.
   * @param tx The tile's column.
   * @param ty The tile's row.
   * @param tile What the tile is.
   * @param chop How many hits the hammer's swing counts for.
   * @returns Whether this job took the swing.
   */
  tryStrike(p: Player, tx: number, ty: number, tile: Tile, chop: number): boolean {
    if (tile === 'altar' && !this.world.structureQueries.awake(tx, ty)) {
      this.offer(p, tx, ty);
      return true;
    }
    return false;
  }

  /**
   * Bleeds a player on an altar: it takes some health as a fresh wound
   * (never their last) and wakes the altar, glowing, for a while, so
   * monsters dying near it bleed more.
   * @param p The player.
   * @param tx The tile's column.
   * @param ty The tile's row.
   */
  private offer(p: Player, tx: number, ty: number): void {
    if (p.hp <= ALTAR_HP_COST) {
      this.outbox.sound(p, 'error');
      return;
    }
    p.wound(ALTAR_HP_COST, this.world.time);
    this.world.lights.kindle(tx, ty, ALTAR_AWAKE_SECONDS);
    this.outbox.events.push({ t: 'chips', tx, ty, chip: 'stone', health: this.world.resources.health(tx, ty) });
    this.outbox.sound(p, 'unlock');
  }
}
