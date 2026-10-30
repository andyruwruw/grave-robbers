// Types
import type { WorldMap } from '@halloween/shared/world/world-map';
import type { Player } from '../players/player';
import type { Departed } from '../types/players';

/**
 * Who is in the game: the players by token, what leavers keep by name,
 * and where players spawn on the current map.
 */
export class PlayerRoster {
  /**
   * Everyone in the game, by token.
   */
  readonly players = new Map<string, Player>();

  /**
   * What players who left keep, by lowercased name.
   */
  readonly departed = new Map<string, Departed>();

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
