// Packages
import { GEAR_SLOTS } from '@halloween/shared/gear/gear-catalog';
import { GOODS, RESOURCES, stock } from '@halloween/shared/goods/goods';
import { DROP_AMOUNT } from '@halloween/shared/goods/ground-items';
import { isMaterialItem } from '@halloween/shared/inventory/bag-items';
import { facingTile } from '@halloween/shared/world/targeting';

// Local Imports
import { GameSystem } from '../core/game-system';

// Types
import type { GearSlot } from '@halloween/shared/gear/types/gear-def';
import type { Goods, Resource } from '@halloween/shared/goods/goods';
import type { BagItem } from '@halloween/shared/inventory/bag-items';
import type { Player } from '../players/player';

/**
 * Things leaving a player's hands for the ground: thrown on purpose, or
 * spilled when they die.
 */
export class DropSystem extends GameSystem {
  /**
   * Throws a bag item (from a bag index or an equipped slot) onto the
   * facing tile, or at the player's feet if that tile is blocked.
   * @param token The player's token.
   * @param from A bag index or an equipped slot.
   */
  dropGear(token: string, from: GearSlot | number): void {
    const p = this.players.get(token);
    if (!p || p.dead) {
      return;
    }
    let item: BagItem | null = null;
    if (typeof from === 'number' && Number.isInteger(from) && p.bag.bag[from]) {
      item = p.bag.bag[from];
      p.bag.bag[from] = null;
    } else if (typeof from === 'string' && GEAR_SLOTS.includes(from) && p.bag.equipped[from]) {
      item = p.bag.equipped[from];
      p.bag.equipped[from] = null;
    }
    if (!item) {
      return;
    }
    this.outbox.inventoryChanged.add(p.token);
    this.outbox.sound(p, 'drop');
    const { tx, ty } = facingTile(p.x, p.y, p.facing);
    const open = !this.world.map.isSolid(tx, ty);
    if (isMaterialItem(item)) {
      this.world.items.addItem(open ? tx + 0.5 : p.x, open ? ty + 0.5 : p.y, stock({ [item.material]: item.count }), p.id);
      return;
    }
    this.world.items.addHeld(open ? tx + 0.5 : p.x, open ? ty + 0.5 : p.y, item, p.id);
  }

  /**
   * Throws up to DROP_AMOUNT of a resource onto the facing tile, or at the
   * player's feet if that tile is blocked.
   * @param token The player's token.
   * @param resource Which resource.
   */
  drop(token: string, resource: Resource): void {
    const p = this.players.get(token);
    if (!p || p.dead || !RESOURCES.includes(resource)) {
      return;
    }
    const amount = Math.min(DROP_AMOUNT, p.inventory[resource]);
    if (amount === 0) {
      return;
    }
    p.inventory[resource] -= amount;
    this.outbox.inventoryChanged.add(p.token);
    this.outbox.sound(p, 'drop');
    const { tx, ty } = facingTile(p.x, p.y, p.facing);
    const open = !this.world.map.isSolid(tx, ty);
    const contents = stock({ [resource]: amount });
    this.world.items.addItem(open ? tx + 0.5 : p.x, open ? ty + 0.5 : p.y, contents, p.id);
  }

  /**
   * Leaves a bag item on the ground: materials as a pile, anything else as
   * an item to grab.
   * @param x Where (tiles across).
   * @param y Where (tiles down).
   * @param item The item.
   */
  dropAt(x: number, y: number, item: BagItem): void {
    if (isMaterialItem(item)) {
      this.world.items.addItem(x, y, stock({ [item.material]: item.count }), null);
    } else {
      this.world.items.addHeld(x, y, item, null);
    }
  }

  /**
   * Drops a player's bag where they stand: materials as one pile, each
   * piece of gear and stack of structures scattered around it.
   * @param p The player.
   */
  spill(p: Player): void {
    const pile = stock();
    for (const item of p.bag.bag) {
      if (item && isMaterialItem(item)) {
        pile[item.material] += item.count;
      } else if (item) {
        const angle = Math.random() * Math.PI * 2;
        this.world.items.addHeld(p.x + Math.cos(angle) * 0.4, p.y + Math.sin(angle) * 0.4, item, null, p.id);
      }
    }
    if (GOODS.some((g: Goods): boolean => pile[g] > 0)) {
      this.world.items.addItem(p.x, p.y, pile, null, p.id);
    }
  }
}
