// Packages
import { GATHERABLE } from '@halloween/shared/loot/gathering';
import { isStructure } from '@halloween/shared/structures/structure-catalog';
import { facingTile } from '@halloween/shared/world/targeting';

// Local Imports
import { GameSystem } from '../core/game-system';
import { ChestJob } from './chest-job';
import { HAMMER_JOBS } from './config/jobs';
import { GatherJob } from './gather-job';
import { GraveJob } from './grave-job';
import { LampJob } from './lamp-job';
import { PumpkinJob } from './pumpkin-job';
import { RepairJob } from './repair-job';
import { StashJob } from './stash-job';
import { StructureJob } from './structure-job';
import { TombJob } from './tomb-job';

// Types
import type { Player } from '../players/player';
import type { TileJob } from './tile-job';

/**
 * Swings that land on the facing tile instead of a body: each kind of
 * tile is a `TileJob`, tried in order until one takes the swing. A swing
 * only hits and works; feeding, relighting, loading, offering, watering,
 * collecting and opening are the USE button's (`UseSystem`).
 */
export class TileJobSystem extends GameSystem {
  /**
   * Every job a tile can be, in the order they're tried. The order
   * matters: a wrench's repair comes before anything that breaks a
   * structure, and the stash (which a swing never breaks) before the
   * catch-all structure job.
   */
  private readonly _jobs: TileJob[] = [
    new PumpkinJob(this._game),
    new ChestJob(this._game),
    new RepairJob(this._game),
    new StashJob(this._game),
    new StructureJob(this._game),
    new GraveJob(this._game),
    new TombJob(this._game),
    new LampJob(this._game),
    new GatherJob(this._game),
  ];

  /**
   * Whether the tile a player faces is a job for the hammer: anything to
   * gather, dig, rob, smash, open, refuel, or knock down.
   * @param p The player.
   * @returns True if the hammer comes out.
   */
  jobAhead(p: Player): boolean {
    const { tx, ty } = facingTile(p.x, p.y, p.facing);
    const tile = this.world.map.get(tx, ty);
    return isStructure(tile) || !!GATHERABLE[tile] || HAMMER_JOBS.has(tile);
  }

  /**
   * A swing landing on the facing tile: the first job that takes it.
   * @param p The player.
   * @param chop How many hits the hammer's swing counts for.
   */
  strikeTile(p: Player, chop: number): void {
    const { tx, ty } = facingTile(p.x, p.y, p.facing);
    const tile = this.world.map.get(tx, ty);
    for (const job of this._jobs) {
      if (job.tryStrike(p, tx, ty, tile, chop)) {
        return;
      }
    }
  }
}
