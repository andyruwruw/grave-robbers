// Packages
import { STASH_REACH } from '@halloween/shared/structures/stations';

// Local Imports
import { GameSystem } from '../core/game-system';
import { putInto } from './helpers/slots';

// Types
import type { BagItem } from '@halloween/shared/inventory/bag-items';
import type { Player } from '../players/player';
import type { PlayerSave } from '../storage/types/save';

/**
 * Storage chests: moving items in and out of the open one, closing and
 * taking it down, and the bags of broken ones.
 */
export class StashSystem extends GameSystem {
  /**
   * Moves a bag item into the open storage chest, or a chest item into the
   * bag (stacking where it can); whatever doesn't fit stays put.
   * @param token The player's token.
   * @param from Which side the item is on.
   * @param index Its slot there.
   */
  stashMove(token: string, from: 'bag' | 'stash', index: number): void {
    const p = this.players.get(token);
    const stash = p?.stashAt ? this.world.structureDamage.stashAt(p.stashAt.tx, p.stashAt.ty) : null;
    if (!p || p.dead || !stash || !Number.isInteger(index)) {
      return;
    }
    if (from === 'bag') {
      const item = p.bag.bag[index];
      if (item) {
        p.bag.bag[index] = putInto(stash.items, item);
      }
    } else {
      const item = stash.items[index];
      if (item) {
        stash.items[index] = this._game.bag.store(p, item, false);
      }
    }
    this.outbox.inventoryChanged.add(p.token);
    this.outbox.stashChanged.add(p.token);
    this.outbox.sound(p, 'pickup');
  }

  /**
   * Closes a player's open storage chest.
   * @param token The player's token.
   */
  stashClose(token: string): void {
    const p = this.players.get(token);
    if (p?.stashAt) {
      p.stashAt = null;
      this.outbox.stashChanged.add(p.token);
    }
  }

  /**
   * Picks up the open storage chest, once it's empty, as a crate.
   * @param token The player's token.
   */
  stashTakeDown(token: string): void {
    const p = this.players.get(token);
    const at = p?.stashAt;
    const stash = at ? this.world.structureDamage.stashAt(at.tx, at.ty) : null;
    if (!p || !at || !stash || stash.keeper !== p.name.toLowerCase() || stash.items.some((item: BagItem | null): boolean => item !== null)) {
      if (p) {
        this.outbox.sound(p, 'error');
      }
      return;
    }
    this.world.structureDamage.damage(at.tx, at.ty, Infinity);
    this._game.pickups.pocket(p, { build: 'stash', count: 1 }, at.tx + 0.5, at.ty + 0.5);
    this.outbox.events.push({ t: 'chips', tx: at.tx, ty: at.ty, chip: 'wood', health: 0 });
    this.outbox.sound(p, 'break');
    this.stashClose(token);
  }

  /**
   * Closes a player's storage chest once it's gone or out of reach.
   * @param p The player.
   */
  checkReach(p: Player): void {
    if (p.stashAt && (!this.world.structureDamage.stashAt(p.stashAt.tx, p.stashAt.ty) || Math.hypot(p.stashAt.tx + 0.5 - p.x, p.stashAt.ty + 0.5 - p.y) > STASH_REACH)) {
      p.stashAt = null;
      this.outbox.stashChanged.add(p.token);
    }
  }

  /**
   * Shows anyone with a storage chest open what a belt took out of it.
   */
  refreshTouched(): void {
    const width = this.world.map.width;
    for (const i of this.world.takeTouchedStashes()) {
      for (const p of this.players.values()) {
        if (p.stashAt && p.stashAt.ty * width + p.stashAt.tx === i) {
          this.outbox.stashChanged.add(p.token);
        }
      }
    }
  }

  /**
   * Scatters the bags of storage chests that were broken last tick over
   * their tiles, kept for their keepers.
   */
  returnSpilled(): void {
    for (const spill of this.world.structureDamage.takeSpilledStashes()) {
      const keeper = [...this.players.values()].find((o: Player): boolean => o.name.toLowerCase() === spill.keeper)?.id ?? [...this._game.roster.away.values()].find((s: PlayerSave): boolean => s.name.toLowerCase() === spill.keeper)?.id ?? null;
      spill.items.forEach((item: BagItem, i: number): void => {
        const angle = (i / spill.items.length) * Math.PI * 2;
        this.world.items.addHeld(spill.x + Math.cos(angle) * 0.4, spill.y + Math.sin(angle) * 0.4, item, null, keeper);
      });
    }
  }
}
