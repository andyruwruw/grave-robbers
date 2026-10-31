// Packages
import { GOODS, stock } from '@halloween/shared/goods/goods';
import { PICKUP_RADIUS } from '@halloween/shared/goods/ground-items';

// Local Imports
import { DROPPER_PICKUP_DELAY } from '../config/loot';

// Types
import type { BagItem } from '@halloween/shared/inventory/bag-items';
import type { Bundle, Goods } from '@halloween/shared/goods/goods';
import type { ItemState } from '@halloween/shared/goods/ground-items';
import type { GroundItem, HeldUnder } from '../types/items';
import type { WorldClock } from '../world-clock';

/**
 * Everything lying on the ground: piles of goods and dropped bag items,
 * by id (saved).
 */
export class GroundItems {
  /**
   * Every item on the ground, by id, in the order they were dropped.
   */
  private readonly _byId = new Map<number, GroundItem>();

  /**
   * The id the next dropped item gets.
   */
  private _nextId = 1;

  /**
   * Sets up an empty ground.
   * @param _clock The world's clock, for when a dropper may pick up again.
   */
  constructor(private readonly _clock: WorldClock) {}

  /**
   * Every item on the ground, live: deleting while iterating is safe.
   * @returns The live iterator of [id, item] pairs.
   */
  entries(): MapIterator<[number, GroundItem]> {
    return this._byId.entries();
  }

  /**
   * Every item on the ground, live.
   * @returns The live iterator of items.
   */
  values(): MapIterator<GroundItem> {
    return this._byId.values();
  }

  /**
   * Takes an item off the ground.
   * @param id The item's id.
   */
  delete(id: number): void {
    this._byId.delete(id);
  }

  /**
   * Takes a pile off the ground once nothing is left in it.
   * @param id The pile's id.
   * @param item The pile.
   */
  dropIfEmpty(id: number, item: GroundItem): void {
    if (GOODS.every((g: Goods): boolean => item[g] === 0)) {
      this._byId.delete(id);
    }
  }

  /**
   * Puts a pile on the ground. The dropper (if any) can't pick it back up
   * for a moment, so a pile dropped underfoot doesn't vanish instantly.
   * @param x Where across, in tiles.
   * @param y Where down, in tiles.
   * @param contents The goods in the pile.
   * @param dropperId Who dropped it, or null.
   * @param ownerId The only player who may pick it up, or null for anyone.
   */
  addItem(x: number, y: number, contents: Bundle, dropperId: string | null, ownerId: string | null = null): void {
    const id = this._nextId++;
    this._byId.set(id, { id, x, y, ...stock(contents), held: null, dropperId, pickupAfter: this._clock.now + DROPPER_PICKUP_DELAY, ownerId });
  }

  /**
   * Puts one bag item (a piece of gear or a stack of structures) on the
   * ground, to be picked up with Grab.
   * @param x Where across, in tiles.
   * @param y Where down, in tiles.
   * @param held The bag item.
   * @param dropperId Who dropped it, or null.
   * @param ownerId The only player who may pick it up, or null for anyone.
   */
  addHeld(x: number, y: number, held: BagItem, dropperId: string | null, ownerId: string | null = null): void {
    const id = this._nextId++;
    this._byId.set(id, { id, x, y, ...stock(), held, dropperId, pickupAfter: this._clock.now + DROPPER_PICKUP_DELAY, ownerId });
  }

  /**
   * Destroys every item on the ground (the admin's Manipulate section).
   */
  clear(): void {
    this._byId.clear();
  }

  /**
   * Bag items on the ground under a player at (x, y), for walking over to
   * pick them up; what they dropped themselves waits a moment.
   * @param playerId The player.
   * @param x Where they stand across, in tiles.
   * @param y Where they stand down, in tiles.
   * @returns The bag items in reach, with their ids.
   */
  heldUnder(playerId: string, x: number, y: number): HeldUnder[] {
    return [...this._byId.values()]
      .filter((item: GroundItem): boolean => item.held !== null && Math.hypot(item.x - x, item.y - y) <= PICKUP_RADIUS && !(item.dropperId === playerId && this._clock.now < item.pickupAfter) && (item.ownerId === null || item.ownerId === playerId))
      .map((item: GroundItem) => ({ id: item.id, held: item.held! }));
  }

  /**
   * Leaves what's left of a partly picked-up stack on the ground, or
   * removes the item.
   * @param id The item's id.
   * @param held What is left, or null to remove it.
   */
  setHeld(id: number, held: BagItem | null): void {
    const item = this._byId.get(id);
    if (item && held) {
      item.held = held;
    } else {
      this._byId.delete(id);
    }
  }

  /**
   * Offers nearby piles to `take`, which says how much of each kind of
   * goods it took (the rest stays on the ground). Returns how much of each
   * was picked up.
   * @param playerId The player picking up.
   * @param x Where they stand across, in tiles.
   * @param y Where they stand down, in tiles.
   * @param take Takes up to `amount` of `goods` and returns how much it took.
   * @returns How much of each kind of goods was picked up.
   */
  pickUp(playerId: string, x: number, y: number, take: (goods: Goods, amount: number) => number): Bundle {
    const took = stock();
    for (const [id, item] of this._byId) {
      if (item.held || Math.hypot(item.x - x, item.y - y) > PICKUP_RADIUS) {
        continue;
      }
      if ((item.dropperId === playerId && this._clock.now < item.pickupAfter) || (item.ownerId !== null && item.ownerId !== playerId)) {
        continue;
      }
      for (const g of GOODS) {
        const n = item[g] > 0 ? take(g, item[g]) : 0;
        item[g] -= n;
        took[g] += n;
      }
      if (GOODS.every((g: Goods): boolean => item[g] === 0)) {
        this._byId.delete(id);
      }
    }
    return took;
  }

  /**
   * Whether anything lies on a tile.
   * @param tx The tile's column.
   * @param ty The tile's row.
   * @returns Whether an item lies there.
   */
  hasItemOn(tx: number, ty: number): boolean {
    return [...this._byId.values()].some((item: GroundItem): boolean => Math.floor(item.x) === tx && Math.floor(item.y) === ty);
  }

  /**
   * Every item on the ground as the clients and saves see it.
   * @returns The items without their server-only fields.
   */
  itemStates(): ItemState[] {
    return [...this._byId.values()].map(({ dropperId: _dropper, pickupAfter: _after, ownerId: _owner, ...state }: GroundItem): ItemState => state);
  }
}
