// Packages
import { GEAR } from '@halloween/shared/gear/gear-catalog';
import { MATERIALS, MATERIAL_STACK, RESOURCES } from '@halloween/shared/goods/goods';
import { BUILD_STACK, isBuildItem, isGearItem, isMaterialItem } from '@halloween/shared/inventory/bag-items';

// Local Imports
import { GameSystem } from '../core/game-system';
import { handsClash } from './helpers/hands-clash';

// Types
import type { Bundle, Goods } from '@halloween/shared/goods/goods';
import type { BagItem } from '@halloween/shared/inventory/bag-items';
import type { Player } from '../players/player';

/**
 * Goods going into and out of a player's bag and pockets.
 */
export class BagSystem extends GameSystem {
  /**
   * Takes in something just crafted, picked up, or found: the first real
   * weapon goes straight into an empty hand (a shield it can't be held with
   * goes to the bag), the rest goes to `store`.
   * @param p The player.
   * @param item The item.
   * @param equip Whether gear may go straight into its empty slot.
   * @returns What didn't fit, or null.
   */
  takeIn(p: Player, item: BagItem, equip: boolean): BagItem | null {
    if (isGearItem(item) && GEAR[item.kind].slot === 'weapon' && !p.bag.equipped.weapon && !GEAR[item.kind].junk && item.kind !== 'stake') {
      p.bag.equipped.weapon = item;
      this.outbox.inventoryChanged.add(p.token);
      this._game.hands.settleHands(p, 'weapon');
      return null;
    }
    return this.store(p, item, equip);
  }

  /**
   * Puts a bag item away: gear in its slot if that's empty (unless `equip`
   * is false), otherwise the first free bag slot; structures onto stacks of
   * the same kind (up to BUILD_STACK), then free slots. A plain torch goes
   * back on the torch stack; an infused one stays its own item.
   * @param p The player.
   * @param item The item.
   * @param equip Whether gear may go straight into its empty slot.
   * @returns What didn't fit, or null.
   */
  store(p: Player, item: BagItem, equip = true): BagItem | null {
    this.outbox.inventoryChanged.add(p.token);
    if (isGearItem(item) && item.kind === 'torch' && !item.infusion) {
      item = { build: 'torch', count: 1 };
    }
    if (isMaterialItem(item)) {
      let left = item.count;
      for (const other of p.bag.bag) {
        if (left > 0 && other && isMaterialItem(other) && other.material === item.material && other.count < MATERIAL_STACK) {
          const moved = Math.min(left, MATERIAL_STACK - other.count);
          other.count += moved;
          left -= moved;
        }
      }
      for (let i = 0; i < p.bag.bag.length && left > 0; i++) {
        if (!p.bag.bag[i]) {
          const moved = Math.min(left, MATERIAL_STACK);
          p.bag.bag[i] = { material: item.material, count: moved };
          left -= moved;
        }
      }
      return left > 0 ? { material: item.material, count: left } : null;
    }
    if (isGearItem(item)) {
      const slot = GEAR[item.kind].slot;
      const clash = slot !== 'armor'
        && handsClash(slot === 'weapon' ? item.kind : p.bag.equipped.weapon?.kind, slot === 'offhand' ? item.kind : p.bag.equipped.offhand?.kind);
      if (equip && !p.bag.equipped[slot] && !clash && item.kind !== 'stake') {
        p.bag.equipped[slot] = item;
        return null;
      }
      const free = p.bag.bag.indexOf(null);
      if (free < 0) {
        return item;
      }
      p.bag.bag[free] = item;
      return null;
    }
    let left = item.count;
    for (const other of p.bag.bag) {
      if (left > 0 && other && isBuildItem(other) && other.build === item.build && other.count < BUILD_STACK) {
        const moved = Math.min(left, BUILD_STACK - other.count);
        other.count += moved;
        left -= moved;
      }
    }
    for (let i = 0; i < p.bag.bag.length && left > 0; i++) {
      if (!p.bag.bag[i]) {
        const moved = Math.min(left, BUILD_STACK);
        p.bag.bag[i] = { build: item.build, count: moved };
        left -= moved;
      }
    }
    return left > 0 ? { build: item.build, count: left } : null;
  }

  /**
   * Takes `cost` from a player, emptying bag stacks from the last slot
   * back, or takes nothing if they can't cover it.
   * @param p The player.
   * @param cost What it costs.
   * @returns Whether they paid.
   */
  pay(p: Player, cost: Bundle): boolean {
    if (!p.canPay(cost)) {
      return false;
    }
    for (const r of RESOURCES) {
      p.inventory[r] -= cost[r];
    }
    for (const m of MATERIALS) {
      let owed = cost[m];
      for (let i = p.bag.bag.length - 1; i >= 0 && owed > 0; i--) {
        const item = p.bag.bag[i];
        if (item && isMaterialItem(item) && item.material === m) {
          const used = Math.min(owed, item.count);
          item.count -= used;
          owed -= used;
          if (item.count === 0) {
            p.bag.bag[i] = null;
          }
        }
      }
    }
    this._game.building.syncBuilding(p);
    this.outbox.inventoryChanged.add(p.token);
    return true;
  }

  /**
   * Gives a player up to `amount` of some goods: candy and blood always
   * fit, materials as far as the bag has room.
   * @param p The player.
   * @param goods What kind of goods.
   * @param amount The most to give.
   * @returns How much they took.
   */
  take(p: Player, goods: Goods, amount: number): number {
    if (goods === 'candy' || goods === 'blood') {
      p.inventory[goods] += amount;
      this.outbox.inventoryChanged.add(p.token);
      return amount;
    }
    const left = this.store(p, { material: goods, count: amount });
    return amount - (left && isMaterialItem(left) ? left.count : 0);
  }
}
