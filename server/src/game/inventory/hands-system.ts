// Packages
import { GEAR, GEAR_SLOTS, twoHanded } from '@halloween/shared/gear/gear-catalog';
import { MATERIAL_STACK } from '@halloween/shared/goods/goods';
import { BUILD_STACK, isBuildItem, isGearItem } from '@halloween/shared/inventory/bag-items';
import { itemKey } from '@halloween/shared/inventory/item-keys';

// Local Imports
import { GameSystem } from '../core/game-system';

// Types
import type { GearSlot } from '@halloween/shared/gear/types/gear-def';
import type { BagItem, GearItem } from '@halloween/shared/inventory/bag-items';
import type { Player } from '../players/player';

/**
 * What a player holds and wears: equipping, the torch in hand, moving
 * items between slots, and keeping a shield away from two-handed weapons.
 */
export class HandsSystem extends GameSystem {
  /**
   * Equips the gear in a bag slot, swapping whatever was in its slot into
   * the bag.
   * @param token The player's token.
   * @param index The bag slot.
   */
  equip(token: string, index: number): void {
    const p = this.players.get(token);
    const item = p && !p.dead && Number.isInteger(index) ? p.bag.bag[index] : null;
    if (p && item && isBuildItem(item) && item.build === 'torch') {
      this.holdTorch(p, index);
      return;
    }
    if (!p || !item || !isGearItem(item)) {
      return;
    }
    const slot = GEAR[item.kind].slot;
    p.bag.bag[index] = p.bag.equipped[slot];
    p.bag.equipped[slot] = item;
    if (slot !== 'armor') {
      this.settleHands(p, slot);
    }
    this.stackTorches(p);
    this.outbox.inventoryChanged.add(p.token);
    this.outbox.sound(p, 'equip');
  }

  /**
   * Takes one torch off a stack in the bag into the off hand (whatever was
   * there goes into the bag).
   * @param p The player.
   * @param index The bag slot.
   */
  private holdTorch(p: Player, index: number): void {
    const stack = p.bag.bag[index];
    if (!stack || !isBuildItem(stack) || stack.build !== 'torch') {
      return;
    }
    const old = p.bag.equipped.offhand;
    stack.count--;
    if (stack.count === 0) {
      p.bag.bag[index] = null;
    }
    p.bag.equipped.offhand = { kind: 'torch', wear: GEAR.torch.wear };
    if (old) {
      const left = this._game.bag.store(p, old, false);
      if (left) {
        this._game.drops.dropAt(p.x, p.y, left);
      }
    }
    this.settleHands(p, 'offhand');
    this._game.building.syncBuilding(p);
    this.outbox.inventoryChanged.add(p.token);
    this.outbox.sound(p, 'equip');
  }

  /**
   * A torch out of the hand goes back on a stack of torches: there's one
   * torch item, held or placed.
   * @param p The player.
   */
  private stackTorches(p: Player): void {
    for (let i = 0; i < p.bag.bag.length; i++) {
      const item = p.bag.bag[i];
      if (item && isGearItem(item) && item.kind === 'torch') {
        p.bag.bag[i] = null;
        const left = this._game.bag.store(p, { build: 'torch', count: 1 });
        if (left) {
          this._game.drops.dropAt(p.x, p.y, left);
        }
      }
    }
  }

  /**
   * Moves an item from one slot to another (bag indexes or equipped
   * slots), as the phone's bag does when one item is picked and then
   * another slot: into an empty slot, onto a stack of the same thing (up to
   * a full stack), or swapping places. Gear only goes into its own
   * equipped slot; anything else can't be equipped.
   * @param token The player's token.
   * @param from Where the item is: a bag index or an equipped slot.
   * @param to Where it goes: a bag index or an equipped slot.
   */
  moveItem(token: string, from: GearSlot | number, to: GearSlot | number): void {
    const p = this.players.get(token);
    const slotOf = (where: GearSlot | number): 'bag' | 'equipped' | null =>
      (typeof where === 'number' ? (Number.isInteger(where) && where >= 0 && where < p!.bag.bag.length ? 'bag' : null) : GEAR_SLOTS.includes(where) ? 'equipped' : null);
    if (!p || p.dead || from === to || !slotOf(from) || !slotOf(to)) {
      return;
    }
    const get = (where: GearSlot | number): BagItem | null => (typeof where === 'number' ? p.bag.bag[where] : p.bag.equipped[where]);
    const put = (where: GearSlot | number, item: BagItem | null): void => {
      if (typeof where === 'number') {
        p.bag.bag[where] = item;
      } else {
        p.bag.equipped[where] = item as GearItem | null;
      }
    };
    const fits = (item: BagItem | null, where: GearSlot | number): boolean =>
      typeof where === 'number' || item === null || (isGearItem(item) && GEAR[item.kind].slot === where);
    const item = get(from);
    const there = get(to);
    if (!item) {
      return;
    }
    if (to === 'offhand' && typeof from === 'number' && isBuildItem(item) && item.build === 'torch') {
      this.holdTorch(p, from);
      return;
    }
    if (there && !isGearItem(item) && !isGearItem(there) && itemKey(item) === itemKey(there)) {
      const room = (isBuildItem(there) ? BUILD_STACK : MATERIAL_STACK) - there.count;
      const moved = Math.min(room, item.count);
      if (moved <= 0) {
        this.outbox.sound(p, 'error');
        return;
      }
      there.count += moved;
      item.count -= moved;
      if (item.count === 0) {
        put(from, null);
      }
    } else if (fits(item, to) && fits(there, from)) {
      put(to, item);
      put(from, there);
      if (to === 'weapon' || to === 'offhand') {
        this.settleHands(p, to);
      } else if (from === 'weapon' || from === 'offhand') {
        this.settleHands(p, from);
      }
      this.stackTorches(p);
    } else {
      this.outbox.sound(p, 'error');
      return;
    }
    this.outbox.inventoryChanged.add(p.token);
    this.outbox.sound(p, typeof to === 'string' || typeof from === 'string' ? 'equip' : 'pickup');
  }

  /**
   * Moves an equipped piece back into the bag, if there's room.
   * @param token The player's token.
   * @param slot The equipped slot.
   */
  unequip(token: string, slot: GearSlot): void {
    const p = this.players.get(token);
    const item = p && !p.dead && GEAR_SLOTS.includes(slot) ? p.bag.equipped[slot] : null;
    if (!p || !item) {
      return;
    }
    const free = p.bag.bag.indexOf(null);
    if (free < 0) {
      this.outbox.sound(p, 'error');
      return;
    }
    p.bag.bag[free] = item;
    p.bag.equipped[slot] = null;
    this.stackTorches(p);
    this.outbox.inventoryChanged.add(p.token);
    this.outbox.sound(p, 'equip');
  }

  /**
   * A shield and a two-handed weapon can't be held together: whichever
   * of them wasn't just put in hand goes back into the bag (or at the
   * player's feet if the bag is full).
   * @param p The player.
   * @param kept The hand that was just filled.
   */
  settleHands(p: Player, kept: 'weapon' | 'offhand'): void {
    if (p.bag.equipped.offhand?.kind !== 'shield' || !twoHanded(p.bag.equipped.weapon?.kind)) {
      return;
    }
    const other = kept === 'weapon' ? 'offhand' : 'weapon';
    const item = p.bag.equipped[other]!;
    p.bag.equipped[other] = null;
    const left = this._game.bag.store(p, item, false);
    if (left) {
      this._game.drops.dropAt(p.x, p.y, left);
    }
  }
}
