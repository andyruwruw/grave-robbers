// Packages
import { GOODS, stock } from '@halloween/shared/goods/goods';
import {
  BELT_PULL_SECONDS,
  BELT_PULL_STACK,
  BELT_SPEED,
  CONVEYORS,
} from '@halloween/shared/structures/automation';
import { SORT_SIDES, SORT_STEP, sortKeyOf } from '@halloween/shared/structures/sorting';

// Local Imports
import { WorldFeature } from '../world-feature';

// Types
import type { Bundle, Goods } from '@halloween/shared/goods/goods';
import type { BagItem } from '@halloween/shared/inventory/bag-items';
import type { GroundItem } from '../types/items';
import type { StructureState } from '../types/structures';

/**
 * Conveyor belts and sorters moving what lies on them, one thing to a
 * tile, and belts pulling things out of what's behind them.
 */
export class Conveyor extends WorldFeature {
  /**
   * When each belt (by tile index) may next pull something out.
   */
  private readonly _pullAt = new Map<number, number>();

  /**
   * Tiles of storage chests a belt took something out of since the last
   * `takeTouchedStashes`, so whoever has one open sees it.
   */
  private readonly _touchedStashes = new Set<number>();

  /**
   * Moves everything on belts and sorters, then lets empty belts pull. A
   * belt or sorter tile holds one thing: what lies on it moves the way the
   * tile sends it (a belt the way it was laid, a sorter the side routed to
   * that thing, else straight on), pulled to the middle, and passes to the
   * next tile only if that one's free. Otherwise it waits at the edge, and
   * so does everything behind it: the line jams, and its first belt stops
   * pulling. At the end of a line things run off onto open floor, or wait
   * at the edge of anything solid (a station there takes them in).
   * @param dt Seconds since the last step.
   */
  convey(dt: number): void {
    const width = this.map.width;
    const on = new Map<number, number>();
    for (const [id, item] of this.items.entries()) {
      const i = Math.floor(item.y) * width + Math.floor(item.x);
      if (CONVEYORS.has(this.map.get(Math.floor(item.x), Math.floor(item.y))) && !on.has(i)) {
        on.set(i, id);
      }
    }
    for (const [id, item] of this.items.entries()) {
      this.move(id, item, dt, on);
    }
    this.pull(on);
  }

  /**
   * Returns and clears the storage chests belts took from.
   * @returns Their tile indexes.
   */
  takeTouchedStashes(): number[] {
    const touched = [...this._touchedStashes];
    this._touchedStashes.clear();
    return touched;
  }

  /**
   * Moves one thing along the belt or sorter under it.
   * @param id Its id.
   * @param item The thing.
   * @param dt Seconds since the last step.
   * @param on What's on each conveyor tile, kept up to date as things move.
   */
  private move(id: number, item: GroundItem, dt: number, on: Map<number, number>): void {
    const tx = Math.floor(item.x);
    const ty = Math.floor(item.y);
    const dir = this.wayFor(tx, ty, item);
    if (!dir) {
      return;
    }
    const [dx, dy] = dir;
    const width = this.map.width;
    const here = ty * width + tx;
    const step = BELT_SPEED * dt;
    const center = (v: number, t: number): number => v + Math.max(-step, Math.min(step, t + 0.5 - v));
    let x = dx === 0 ? center(item.x, tx) : item.x + dx * step;
    let y = dy === 0 ? center(item.y, ty) : item.y + dy * step;
    const nx = Math.floor(x);
    const ny = Math.floor(y);
    if (nx !== tx || ny !== ty) {
      const next = ny * width + nx;
      const taken = on.has(next) && on.get(next) !== id;
      if ((CONVEYORS.has(this.map.get(nx, ny)) && taken) || this.map.isSolid(nx, ny)) {
        x = dx === 0 ? x : tx + 0.5 + dx * 0.45;
        y = dy === 0 ? y : ty + 0.5 + dy * 0.45;
      } else {
        if (on.get(here) === id) {
          on.delete(here);
        }
        if (CONVEYORS.has(this.map.get(nx, ny))) {
          on.set(next, id);
        }
      }
    }
    item.x = x;
    item.y = y;
  }

  /**
   * The way the tile under a thing sends it: a belt the way it was laid, a
   * sorter the side routed to that thing, else the way it was laid.
   * @param tx Tile column.
   * @param ty Tile row.
   * @param item The thing.
   * @returns The step, or null off any conveyor.
   */
  private wayFor(tx: number, ty: number, item: GroundItem): [number, number] | null {
    const tile = this.map.get(tx, ty);
    if (!CONVEYORS.has(tile)) {
      return null;
    }
    if (tile === 'sorter') {
      const routes = this.structures.get(ty * this.map.width + tx)?.routes;
      const key = routes ? sortKeyOf(item) : null;
      const side = key ? SORT_SIDES.find((s): boolean => routes![s] === key) : undefined;
      if (side) {
        return SORT_STEP[side];
      }
    }
    return this.map.turnOf(tx, ty);
  }

  /**
   * Lets each empty belt, every BELT_PULL_SECONDS, take one thing out of
   * what's behind or beside it (never in front, where it leads): what a
   * station, digger, or fountain holds for it, a digger's hoard, or the
   * first thing in a storage chest.
   * @param on What's on each conveyor tile.
   */
  private pull(on: Map<number, number>): void {
    const width = this.map.width;
    const now = this.clock.now;
    for (const [i] of this.structures.entries()) {
      const tx = i % width;
      const ty = (i - tx) / width;
      if (this.map.get(tx, ty) !== 'belt' || on.has(i) || now < (this._pullAt.get(i) ?? 0)) {
        continue;
      }
      const [dx, dy] = this.map.turnOf(tx, ty) ?? [1, 0];
      for (const [sx, sy] of [[-dx, -dy], [dy, dx], [-dy, -dx]]) {
        const from = (ty + sy) * width + tx + sx;
        const s = this.map.inBounds(tx + sx, ty + sy) ? this.structures.get(from) : undefined;
        const taken = s ? this.take(s, from) : null;
        if (taken) {
          const x = tx + 0.5 - dx * 0.3;
          const y = ty + 0.5 - dy * 0.3;
          if ('held' in taken) {
            this.items.addHeld(x, y, taken.held, null);
          } else {
            this.items.addItem(x, y, taken.goods, null);
          }
          on.set(i, -1);
          this._pullAt.set(i, now + BELT_PULL_SECONDS);
          break;
        }
      }
    }
  }

  /**
   * Takes one thing out of a structure for a belt: up to BELT_PULL_STACK of
   * one good it holds for belts (`out`) or in its hoard, or the first thing
   * in a storage chest.
   * @param s The structure.
   * @param i Its tile index.
   * @returns What was taken, or null if there's nothing.
   */
  private take(s: StructureState, i: number): { held: BagItem } | { goods: Bundle } | null {
    for (const store of [s.out, s.hoard]) {
      const g = store ? GOODS.find((k: Goods): boolean => (store[k] ?? 0) > 0) : undefined;
      if (store && g) {
        const amount = Math.min(BELT_PULL_STACK, store[g]!);
        store[g] = store[g]! - amount;
        return { goods: stock({ [g]: amount }) };
      }
    }
    const slot = s.stash?.findIndex((item: BagItem | null): boolean => item !== null) ?? -1;
    if (s.stash && slot >= 0) {
      const held = s.stash[slot]!;
      s.stash[slot] = null;
      this._touchedStashes.add(i);
      return { held };
    }
    return null;
  }
}
