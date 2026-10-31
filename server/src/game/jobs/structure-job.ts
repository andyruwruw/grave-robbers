// Packages
import { isStructure } from '@halloween/shared/structures/structure-catalog';

// Local Imports
import { BREAK_HITS, BREAK_RESET_SECONDS, STONE_STRUCTURES } from './config/jobs';
import { TileJob } from './tile-job';

// Types
import type { StructureKind } from '@halloween/shared/structures/types/structures';
import type { Tile } from '@halloween/shared/world/tiles';
import type { Player } from '../players/player';

/**
 * Any other structure: a swing breaks it down
 * (BREAK_HITS swings in a row, back to the bag; a grave under a bone
 * digger is never dug through, the digger comes off first).
 */
export class StructureJob extends TileJob {
  /**
   * Structures being broken down, by tile index: swings so far and when
   * the last landed.
   */
  private readonly _knocks = new Map<number, { hits: number; at: number }>();

  /**
   * One swing at breaking down a structure (feeding and relighting are
   * USE's, see `UseSystem`).
   * @param p The player.
   * @param tx The tile's column.
   * @param ty The tile's row.
   * @param tile What the tile is.
   * @param chop How many hits the hammer's swing counts for.
   * @returns Whether this job took the swing.
   */
  tryStrike(p: Player, tx: number, ty: number, tile: Tile, chop: number): boolean {
    if (isStructure(tile)) {
      const health = this.knock(p, tx, ty, tile);
      const chip = STONE_STRUCTURES.has(tile) ? 'stone' : 'wood';
      this.outbox.sound(p, health === 0 ? 'break' : chip === 'stone' ? 'mine' : 'chop');
      this.outbox.events.push({ t: 'chips', tx, ty, chip, health });
      return true;
    }
    return false;
  }

  /**
   * One swing at breaking a structure down: BREAK_HITS in a row (none more
   * than BREAK_RESET_SECONDS apart) take it back to the bag as a crate.
   * @param p The player.
   * @param tx The tile's column.
   * @param ty The tile's row.
   * @param tile The structure.
   * @returns How much of it is left, 0 to 1.
   */
  private knock(p: Player, tx: number, ty: number, tile: StructureKind): number {
    const i = ty * this.world.map.width + tx;
    const now = this.world.time;
    const last = this._knocks.get(i);
    const hits = last && now - last.at <= BREAK_RESET_SECONDS ? last.hits + 1 : 1;
    p.protectedUntil = 0;
    if (hits < BREAK_HITS) {
      this._knocks.set(i, { hits, at: now });
      return 1 - hits / BREAK_HITS;
    }
    this._knocks.delete(i);
    this.world.structureDamage.damage(tx, ty, Infinity, true);
    this._game.pickups.pocket(p, { build: tile === 'sprout' ? 'seeds' : tile, count: 1 }, tx + 0.5, ty + 0.5);
    return 0;
  }
}
