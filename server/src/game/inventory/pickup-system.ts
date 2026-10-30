// Packages
import { GOODS, stock } from '@halloween/shared/goods/goods';
import { isBuildItem } from '@halloween/shared/inventory/bag-items';

// Local Imports
import { GameSystem } from '../core/game-system';

// Types
import type { Bundle, Goods } from '@halloween/shared/goods/goods';
import type { BagItem } from '@halloween/shared/inventory/bag-items';
import type { Player } from '../players/player';

/**
 * Things coming into a player's hands: loot handed straight to them, and
 * what they walk over.
 */
export class PickupSystem extends GameSystem {
  /**
   * Puts what someone broke or found straight into their bag (never into
   * a hand), or onto the ground at (x, y) if it doesn't fit.
   * @param p The player.
   * @param item The item.
   * @param x Where it lands if it doesn't fit (tiles across).
   * @param y Where it lands if it doesn't fit (tiles down).
   */
  pocket(p: Player, item: BagItem, x: number, y: number): void {
    const left = this._game.bag.takeIn(p, item, false);
    if (left) {
      this.world.items.addHeld(x, y, left, null);
    }
  }

  /**
   * Hands loot straight to whoever broke or killed what it came from (a
   * popup over them for each kind); whatever won't fit in the bag drops at
   * (x, y) as a pile.
   * @param p The player.
   * @param loot The goods.
   * @param x Where what doesn't fit lands (tiles across).
   * @param y Where what doesn't fit lands (tiles down).
   */
  award(p: Player, loot: Bundle, x: number, y: number): void {
    const left = stock();
    let got = false;
    for (const g of GOODS) {
      if (loot[g] <= 0) {
        continue;
      }
      const taken = this._game.bag.take(p, g, loot[g]);
      left[g] = loot[g] - taken;
      if (taken > 0) {
        got = true;
        this.outbox.events.push(g === 'candy' ? { t: 'candy', x: p.x, y: p.y, amount: taken } : { t: 'pickup', x: p.x, y: p.y, goods: g });
      }
    }
    if (got) {
      this.outbox.inventoryChanged.add(p.token);
      this.outbox.sound(p, loot.candy > 0 ? 'candy' : 'pickup');
    }
    if (GOODS.some((g: Goods): boolean => left[g] > 0)) {
      this.world.items.addItem(x, y, left, null);
    }
  }

  /**
   * Picks up gear and stacks of structures the player walks over, into the
   * bag (never equipped). Something they just dropped waits a moment.
   * @param p The player.
   */
  autoGrab(p: Player): void {
    for (const item of this.world.items.heldUnder(p.id, p.x, p.y)) {
      const left = this._game.bag.takeIn(p, item.held, false);
      if (left && (!isBuildItem(left) || !isBuildItem(item.held) || left.count === item.held.count)) {
        continue;
      }
      this.world.items.setHeld(item.id, left);
      this.outbox.sound(p, 'equip');
    }
  }

  /**
   * Picks up the goods lying where a player stands.
   * @param p The player.
   */
  pickUpGround(p: Player): void {
    const took = this.world.items.pickUp(p.id, p.x, p.y, (goods: Goods, amount: number): number => this._game.bag.take(p, goods, amount));
    if (GOODS.some((g: Goods): boolean => took[g] > 0)) {
      this.outbox.inventoryChanged.add(p.token);
      this.outbox.sound(p, took.candy > 0 ? 'candy' : 'pickup');
    }
    if (took.candy > 0) {
      this.outbox.events.push({ t: 'candy', x: p.x, y: p.y, amount: took.candy });
    }
    for (const g of GOODS) {
      if (g !== 'candy' && took[g] > 0) {
        this.outbox.events.push({ t: 'pickup', x: p.x, y: p.y, goods: g });
      }
    }
  }
}
