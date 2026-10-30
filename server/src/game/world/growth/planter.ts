// Local Imports
import {
  GRAVESIDE,
  INNER_TREE_CHANCE,
  INNER_TREE_INSET,
  PATHS,
  ROCK_TARGET,
  TREES,
} from '../config/growth';
import { inView } from '../helpers/tiles';
import { tileIndexes } from '../items/pile-lookup';
import { WorldFeature } from '../world-feature';

// Types
import type { Tile } from '@halloween/shared/world/tiles';
import type { Occupied, StockedTile } from '../types/growth';
import type { TilePoint } from '../types/structures';

/**
 * Finds room for new trees, pumpkins, chests, and rocks, and plants them
 * only where they cut nothing off.
 */
export class Planter extends WorldFeature {
  /**
   * Puts one `tile` on open grass, away from spawns, people, and items:
   * trees beside other trees (so the forest spreads; mostly in the middle
   * of the map), pumpkins beside a
   * path, chests beside graves or hedges, anywhere open when no such spot
   * is left. A spot is only used if every tile reachable (there and back)
   * before still is.
   * @param tile What to grow.
   * @param occupied Whether someone stands on or beside a tile.
   * @returns Where it grew, or null if there was no room.
   */
  grow(tile: StockedTile, occupied: Occupied): TilePoint | null {
    const likes = tile === 'tree' ? TREES : tile === 'pumpkin' ? PATHS : GRAVESIDE;
    const preferred: [number, number][] = [];
    const open: [number, number][] = [];
    for (const [tx, ty] of this.growSpots(occupied)) {
      (this.beside(tx, ty, likes, tile !== 'pumpkin') ? preferred : open).push([tx, ty]);
    }
    let pool = preferred.length > 0 ? preferred : open;
    if (tile === 'tree' && Math.random() < INNER_TREE_CHANCE) {
      const inner = pool.filter(([tx, ty]): boolean => Math.min(tx, ty, this.map.width - 1 - tx, this.map.height - 1 - ty) >= INNER_TREE_INSET);
      pool = inner.length > 0 ? inner : pool;
    }
    return this.plant(tile, pool);
  }

  /**
   * Grass tiles something may appear on: inside the view, not under
   * anyone, any item, or right by a spawn point.
   * @param occupied Whether someone stands on or beside a tile.
   * @returns The open [tx, ty] tiles, row by row.
   */
  growSpots(occupied: Occupied): [number, number][] {
    const itemTiles = tileIndexes(this.items, this.map.width);
    const spawns = this.map.spawnPoints();
    const spots: [number, number][] = [];
    for (let ty = 1; ty < this.map.height - 1; ty++) {
      for (let tx = 1; tx < this.map.width - 1; tx++) {
        if (
          this.map.get(tx, ty) === 'grass'
          && inView(this.view, tx, ty)
          && !occupied(tx, ty)
          && !itemTiles.has(ty * this.map.width + tx)
          && !spawns.some((s: { x: number; y: number }): boolean => Math.abs(Math.floor(s.x) - tx) <= 2 && Math.abs(Math.floor(s.y) - ty) <= 2)
        ) {
          spots.push([tx, ty]);
        }
      }
    }
    return spots;
  }

  /**
   * Sets `tile` on a random spot from `pool` that doesn't cut anything off.
   * @param tile What to plant.
   * @param pool The [tx, ty] spots to try (tried spots are taken out).
   * @returns Where it went, or null if no try worked.
   */
  plant(tile: Tile, pool: [number, number][]): TilePoint | null {
    const before = this.reachable();
    for (let tries = 0; tries < 12 && pool.length > 0; tries++) {
      const [[tx, ty]] = pool.splice(Math.floor(Math.random() * pool.length), 1);
      this.map.set(tx, ty, tile);
      if (this.reachable() === before - 1) {
        return { tx, ty };
      }
      this.map.set(tx, ty, 'grass');
    }
    return null;
  }

  /**
   * Adds one rock if the map is below target, on a grass tile whose eight
   * neighbors are all open so it can never seal off a passage.
   * @param occupied Whether someone stands on or beside a tile.
   */
  maybeGrowRock(occupied: Occupied): void {
    let rocks = 0;
    for (let ty = 0; ty < this.map.height; ty++) {
      for (let tx = 0; tx < this.map.width; tx++) {
        rocks += this.map.get(tx, ty) === 'rock' ? 1 : 0;
      }
    }
    if (rocks >= ROCK_TARGET) {
      return;
    }
    for (let tries = 0; tries < 50; tries++) {
      const tx = 1 + Math.floor(Math.random() * (this.map.width - 2));
      const ty = 1 + Math.floor(Math.random() * (this.map.height - 2));
      if (this.map.get(tx, ty) !== 'grass' || occupied(tx, ty)) {
        continue;
      }
      let open = true;
      for (let dy = -1; dy <= 1 && open; dy++) {
        for (let dx = -1; dx <= 1 && open; dx++) {
          open = !this.map.isSolid(tx + dx, ty + dy);
        }
      }
      if (open) {
        this.map.set(tx, ty, 'rock');
        return;
      }
    }
  }

  /**
   * Whether any neighbor of a tile (diagonals too, if asked) is one of
   * `kinds`.
   * @param tx The tile's column.
   * @param ty The tile's row.
   * @param kinds The tiles to look for.
   * @param diagonal Whether diagonal neighbors count.
   * @returns Whether one is beside it.
   */
  private beside(tx: number, ty: number, kinds: ReadonlySet<Tile>, diagonal: boolean): boolean {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if ((dx !== 0 || dy !== 0) && (diagonal || dx === 0 || dy === 0) && kinds.has(this.map.get(tx + dx, ty + dy))) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * How many tiles can be walked to from the spawns and back.
   * @returns The count.
   */
  private reachable(): number {
    return this.map.roundTrip(this.map.spawnPoints()).reduce((n: number, v: number): number => n + v, 0);
  }
}
