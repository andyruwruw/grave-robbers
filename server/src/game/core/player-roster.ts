// Types
import type { WorldMap } from '@halloween/shared/world/world-map';
import type { Player } from '../players/player';
import type { PlayerSave } from '../storage/types/save';

/**
 * Who is in the game: the players by token, the saved characters who
 * aren't (left, or not back since a restart), and where players spawn on
 * the current map.
 */
export class PlayerRoster {
  /**
   * Everyone in the game, by token.
   */
  readonly players = new Map<string, Player>();

  /**
   * Saved characters not in the game, by id.
   */
  readonly away = new Map<string, PlayerSave>();

  /**
   * Ids of away characters changed since the last save.
   */
  readonly changed = new Set<string>();

  /**
   * Ids of characters released since the last save (their files go).
   */
  readonly released = new Set<string>();

  /**
   * Whoever holds a name, in the game or away (case-insensitive).
   * @param name The name.
   * @returns The player or saved character, or null if it's free.
   */
  holderOf(name: string): Player | PlayerSave | null {
    const lower = name.toLowerCase();
    for (const p of this.players.values()) {
      if (p.name.toLowerCase() === lower) {
        return p;
      }
    }
    for (const s of this.away.values()) {
      if (s.name.toLowerCase() === lower) {
        return s;
      }
    }
    return null;
  }

  /**
   * The away character a token belongs to.
   * @param token The token.
   * @returns The character, or null.
   */
  awayByToken(token: string): PlayerSave | null {
    for (const s of this.away.values()) {
      if (s.token === token) {
        return s;
      }
    }
    return null;
  }

  /**
   * Puts a character away (left, or the slot is closing), to be saved.
   * @param save The character.
   */
  putAway(save: PlayerSave): void {
    this.away.set(save.id, save);
    this.changed.add(save.id);
  }

  /**
   * Where players spawn on the current map.
   */
  private _spawns: { x: number; y: number }[] = [];

  /**
   * Remembers where spawn points are on a new map.
   * @param map The new map.
   */
  resetSpawns(map: WorldMap): void {
    this._spawns = map.spawnPoints();
  }

  /**
   * A random spawn point.
   * @returns A copy of the spawn point.
   */
  randomSpawn(): { x: number; y: number } {
    const s = this._spawns[Math.floor(Math.random() * this._spawns.length)];
    return { x: s.x, y: s.y };
  }
}
