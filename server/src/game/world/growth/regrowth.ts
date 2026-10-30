// Local Imports
import { GROW_INTERVAL, ROCK_CHECK_INTERVAL, TOMBSTONE_SHARE } from '../config/growth';
import { countTiles } from '../helpers/tiles';
import { WorldFeature } from '../world-feature';

// Types
import type { GrownSpot, Occupant, Occupied, StockedTile } from '../types/growth';
import type { WorldSite } from '../types/site';
import type { TilePoint } from '../types/structures';
import type { Planter } from './planter';

/**
 * Keeps the map stocked: stumps rot, rocks come back, gravestones rise
 * from mounds, and trees, pumpkins, and chests grow back toward their
 * targets.
 */
export class Regrowth extends WorldFeature {
  /**
   * Trees, pumpkins, and chests grow back toward their targets (off when
   * the Game tab turns natural spawning off).
   */
  restock = true;

  /**
   * When each stocked tile may next grow one more (world seconds).
   */
  private readonly _growAt: Record<StockedTile, number>;

  /**
   * When the map next checks whether to grow a rock (world seconds).
   */
  private _nextRockCheck = 0;

  /**
   * Sets regrowth up, with the first growth due one interval from now.
   * @param site What every part of the world shares.
   * @param _planter Finds room for what grows.
   * @param targets How many of each stocked tile the map keeps.
   */
  constructor(site: WorldSite, private readonly _planter: Planter, readonly targets: Record<StockedTile, number>) {
    super(site);
    this._growAt = { tree: this.clock.now + GROW_INTERVAL.tree, pumpkin: this.clock.now + GROW_INTERVAL.pumpkin, chest: this.clock.now + GROW_INTERVAL.chest };
  }

  /**
   * Rots stumps, regrows rocks, raises new gravestones from mounds whose
   * time has come, and grows trees, pumpkins, and chests back toward their
   * targets, never onto a tile someone is standing on.
   * @param occupants Everyone standing on the map.
   * @returns Whatever grew this step.
   */
  step(occupants: Occupant[]): GrownSpot[] {
    const occupied = (tx: number, ty: number): boolean =>
      occupants.some((o: Occupant): boolean => Math.abs(o.x - (tx + 0.5)) < 1.2 && Math.abs(o.y - (ty + 0.5)) < 1.2);

    for (const [i, at] of this.timers.regrow) {
      const tx = i % this.map.width;
      const ty = Math.floor(i / this.map.width);
      if (this.clock.now < at) {
        continue;
      }
      if (this.map.get(tx, ty) === 'stump') {
        this.map.set(tx, ty, 'grass');
      }
      this.timers.regrow.delete(i);
    }

    if (this.clock.now >= this._nextRockCheck) {
      this._nextRockCheck = this.clock.now + ROCK_CHECK_INTERVAL;
      this._planter.maybeGrowRock(occupied);
    }

    const grown: GrownSpot[] = [];
    for (const [i, at] of this.timers.mounds) {
      const tx = i % this.map.width;
      const ty = Math.floor(i / this.map.width);
      if (this.map.get(tx, ty) !== 'mound') {
        this.timers.mounds.delete(i);
        continue;
      }
      if (this.clock.now < at || occupied(tx, ty) || this.items.hasItemOn(tx, ty)) {
        continue;
      }
      const tile = Math.random() < TOMBSTONE_SHARE ? 'tombstone' : 'cross';
      this.map.set(tx, ty, tile);
      this.timers.mounds.delete(i);
      grown.push({ tx, ty, tile });
    }
    for (const tile of ['tree', 'pumpkin', 'chest'] as const) {
      if (!this.restock || this.clock.now < this._growAt[tile]) {
        continue;
      }
      this._growAt[tile] = this.clock.now + GROW_INTERVAL[tile] * (0.6 + Math.random() * 0.8);
      const have = tile === 'tree' ? countTiles(this.map, 'tree', 'stump') : countTiles(this.map, tile);
      const at = have < this.targets[tile] ? this._planter.grow(tile, occupied) : null;
      if (at) {
        grown.push({ ...at, tile });
      }
    }
    return grown;
  }

  /**
   * Puts a tree, pumpkin, chest, or rock on open grass anywhere on the
   * map, whatever the targets say (the TV's Game tab). Null if
   * there's no room.
   * @param tile What to put down.
   * @param occupied Whether someone stands on or beside a tile.
   * @returns Where it went, or null.
   */
  spawnTile(tile: StockedTile | 'rock', occupied: Occupied): TilePoint | null {
    return this._planter.plant(tile, this._planter.growSpots(occupied));
  }
}
