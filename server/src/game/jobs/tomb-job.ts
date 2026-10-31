// Packages
import { stock } from '@halloween/shared/goods/goods';
import { DIG_BONES, ROB_BLUEPRINT_CHANCE, ROB_CANDY } from '@halloween/shared/loot/graves';

// Local Imports
import { DiggingJob } from './digging-job';

// Types
import type { Tile } from '@halloween/shared/world/tiles';
import type { Player } from '../players/player';

/**
 * A statue, crypt, or mausoleum: robbing it.
 */
export class TombJob extends DiggingJob {
  /**
   * Robs a statue, crypt, or mausoleum.
   * @param p The player.
   * @param tx The tile's column.
   * @param ty The tile's row.
   * @param tile What the tile is.
   * @param chop How many hits the hammer's swing counts for.
   * @returns Whether this job took the swing.
   */
  tryStrike(p: Player, tx: number, ty: number, tile: Tile, chop: number): boolean {
    if (tile === 'statue' || tile === 'crypt' || tile === 'mausoleum') {
      this.rob(p, tx, ty, tile, chop);
      return true;
    }
    return false;
  }

  /**
   * Digs at a statue, crypt, or mausoleum. The dig that robs it spills
   * candy and bones, and maybe a blueprint; one
   * already robbed has nothing left for a while.
   * @param p The player.
   * @param tx The tile's column.
   * @param ty The tile's row.
   * @param tile What the tile is.
   * @param hits How many hits the swing counts for.
   */
  private rob(p: Player, tx: number, ty: number, tile: 'statue' | 'crypt' | 'mausoleum', hits: number): void {
    let result: 'dug' | 'done' | 'robbed' = 'dug';
    for (let i = 0; i < hits && result === 'dug'; i++) {
      result = this.world.resources.rob(tx, ty);
    }
    if (result === 'robbed') {
      this.outbox.sound(p, 'error');
      return;
    }
    const done = result === 'done';
    this.outbox.events.push({ t: 'dig', tx, ty, tile, done, health: this.world.resources.health(tx, ty) });
    this.outbox.sound(p, done ? 'break' : 'dig');
    this._game.damage.wear(p, 'weapon');
    if (!done) {
      return;
    }
    const { x, y } = this.spillSpot(p, tx, ty);
    this._game.pickups.award(p, stock({ candy: this.roll(ROB_CANDY[tile]), bone: this.roll(DIG_BONES) }), x, y);
    this.findBlueprint(p, ROB_BLUEPRINT_CHANCE);
  }

  /**
   * Where loot from a solid tile lands: on the robber's side of it.
   * @param p The player.
   * @param tx The tile's column.
   * @param ty The tile's row.
   * @returns Where it lands.
   */
  private spillSpot(p: Player, tx: number, ty: number): { x: number; y: number } {
    const cx = tx + 0.5;
    const cy = ty + 0.5;
    const d = Math.hypot(p.x - cx, p.y - cy) || 1;
    return { x: cx + ((p.x - cx) / d) * 0.75, y: cy + ((p.y - cy) / d) * 0.75 };
  }
}
