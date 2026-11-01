// Packages
import { MAX_HP } from '@halloween/shared/players/health';

// Local Imports
import { GameSystem } from './game-system';

// Types
import type { PhoneSound } from '@halloween/shared/audio/phone-sounds';
import type { BagItem } from '@halloween/shared/inventory/bag-items';
import type { GameEvent } from '@halloween/shared/protocol/game-events';
import type { Vitals } from '@halloween/shared/protocol/state/vitals';
import type { Player } from '../players/player';
import type { Carried } from '../types/players';

/**
 * What the game has to tell the hub since its last drain: events for the
 * TV, sounds and belongings for phones, opened chests, and naughty kills.
 * The hub drains every queue after each step.
 */
export class Outbox extends GameSystem {
  /**
   * Events since the hub last drained them.
   */
  events: GameEvent[] = [];

  /**
   * Tokens whose belongings changed.
   */
  readonly inventoryChanged = new Set<string>();

  /**
   * Sounds queued for each phone, by token.
   */
  private _sounds = new Map<string, PhoneSound[]>();

  /**
   * Tokens whose open storage chest changed.
   */
  readonly stashChanged = new Set<string>();

  /**
   * Players who just killed another player, with the candy that cost them.
   */
  readonly naughty = new Map<string, number>();

  /**
   * Queues a sound for a player's phone.
   * @param p The player.
   * @param name Which sound.
   */
  sound(p: Player, name: PhoneSound): void {
    const list = this._sounds.get(p.token);
    if (list) {
      list.push(name);
    } else {
      this._sounds.set(p.token, [name]);
    }
  }

  /**
   * Returns and clears the events since the last call.
   * @returns The events since the last call.
   */
  takeEvents(): GameEvent[] {
    const events = this.events;
    this.events = [];
    return events;
  }

  /**
   * Returns and clears each phone's sounds since the last call.
   * @returns Each token with its sounds.
   */
  takeSounds(): [string, PhoneSound[]][] {
    const sounds = [...this._sounds];
    this._sounds.clear();
    return sounds;
  }

  /**
   * Returns and clears the players who just killed another player, with
   * the candy that cost them.
   * @returns Each token with the candy it lost.
   */
  takeNaughty(): [string, number][] {
    const naughty = [...this.naughty];
    this.naughty.clear();
    return naughty;
  }

  /**
   * Returns and clears the inventories that changed since the last call.
   * @returns Each token with what it now carries.
   */
  takeInventoryChanges(): [string, Carried][] {
    const changes = [...this.inventoryChanged].flatMap((token: string): [string, Carried][] => {
      const p = this.players.get(token);
      return p ? [[token, this._game.views.carried(p)]] : [];
    });
    this.inventoryChanged.clear();
    return changes;
  }

  /**
   * Returns the phones whose vitals changed visibly (a half heart,
   * protection, or death) since the last call.
   * @returns Each token with its vitals.
   */
  takeVitalsChanges(): [string, Vitals][] {
    const changes: [string, Vitals][] = [];
    for (const p of this.players.values()) {
      const key = `${Math.ceil(p.hp * 2)}|${Math.ceil(p.wounded() * 2)}|${Math.ceil(Math.min(p.feast, MAX_HP - p.hp) * 2)}|${p.protected}|${p.dead}|${Math.ceil(p.overheal * 2)}`;
      if (key !== p.vitalsKey) {
        p.vitalsKey = key;
        changes.push([p.token, this._game.views.vitals(p)]);
      }
    }
    return changes;
  }

  /**
   * Returns and clears the phones whose open storage chest changed (null:
   * closed).
   * @returns Each token with its chest's contents (null: closed).
   */
  takeStashChanges(): [string, (BagItem | null)[] | null, boolean][] {
    const changes = [...this.stashChanged].flatMap((token: string): [string, (BagItem | null)[] | null, boolean][] => {
      const p = this.players.get(token);
      const stash = p?.stashAt ? this.world.structureDamage.stashAt(p.stashAt.tx, p.stashAt.ty) : null;
      return p ? [[token, stash ? structuredClone(stash.items) : null, stash?.keeper === p.name.toLowerCase()]] : [];
    });
    this.stashChanged.clear();
    return changes;
  }
}
