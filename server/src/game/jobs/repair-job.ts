// Packages
import { stock } from '@halloween/shared/goods/goods';
import { structureHp } from '@halloween/shared/skill-tree/upgrades/structure-upgrades';
import { repairMaterial } from '@halloween/shared/structures/repair';
import { isStructure } from '@halloween/shared/structures/structure-catalog';

// Local Imports
import { STONE_STRUCTURES } from './config/jobs';
import { TileJob } from './tile-job';

// Types
import type { Tile } from '@halloween/shared/world/tiles';
import type { Player } from '../players/player';

/**
 * A wrench's swing at a structure mends it (anyone's): `repair` of its
 * full health for one of what it's mostly built from (`repairMaterial`).
 * It takes every wrench swing at a structure, so a wrench never knocks
 * one down; one already whole, or with nothing to mend it with, buzzes.
 */
export class RepairJob extends TileJob {
  /**
   * Mends the structure, if the swing is a wrench's.
   * @param p The player.
   * @param tx The tile's column.
   * @param ty The tile's row.
   * @param tile What the tile is.
   * @param _chop How many hits the hammer's swing counts for.
   * @returns Whether this job took the swing.
   */
  tryStrike(p: Player, tx: number, ty: number, tile: Tile, _chop: number): boolean {
    if (!isStructure(tile) || p.swingWith || p.bag.equipped.weapon?.kind !== 'wrench') {
      return false;
    }
    const s = this.world.structures.get(ty * this.world.map.width + tx);
    const full = structureHp(tile, s?.level ?? 0);
    const material = repairMaterial(tile);
    if (!s || s.hp >= full || !material || !this._game.bag.pay(p, stock({ [material]: 1 }))) {
      this.outbox.sound(p, 'error');
      return true;
    }
    s.hp = Math.min(full, s.hp + full * (p.weapon().repair ?? 0));
    this.outbox.sound(p, 'build');
    this.outbox.events.push({ t: 'chips', tx, ty, chip: STONE_STRUCTURES.has(tile) ? 'stone' : 'wood', health: Math.round((s.hp / full) * 100) / 100 });
    return true;
  }
}
