// Packages
import { randomBytes, randomUUID } from 'node:crypto';
import { MAX_NAME_LENGTH, MAX_PLAYERS, PLAYER_COLORS } from '@halloween/shared/players/roster';

// Local Imports
import { GameSystem } from '../core/game-system';
import { Player } from './player';

// Types
import type { PlayerIdentity } from '@halloween/shared/protocol/state/player-state';
import type { JoinResult } from '../types/players';

/**
 * Players coming and going: joining, a phone coming back or going away,
 * and leaving.
 */
export class JoinSystem extends GameSystem {
  /**
   * Creates a new player from a phone's name and color pick.
   * @param rawName The name typed on the phone.
   * @param color The color picked, one of PLAYER_COLORS.
   * @returns Their identity, or why they can't join.
   */
  join(rawName: string, color: string): JoinResult {
    const name = rawName.replace(/\s+/g, ' ').trim().slice(0, MAX_NAME_LENGTH);
    if (!name) {
      return { ok: false, error: 'Pick a name first.' };
    }
    if (!PLAYER_COLORS.includes(color)) {
      return { ok: false, error: 'Unknown color.' };
    }
    if (this.players.size >= MAX_PLAYERS) {
      return { ok: false, error: 'The graveyard is full.' };
    }
    const back = this._game.roster.departed.get(name.toLowerCase());
    this._game.roster.departed.delete(name.toLowerCase());
    const spawn = this._game.roster.randomSpawn();
    const player = new Player({ id: back?.id ?? randomUUID(), token: randomBytes(18).toString('base64url'), name, color, x: spawn.x, y: spawn.y, time: this.world.time, back });
    this.players.set(player.token, player);
    return { ok: true, identity: this._game.views.identityOf(player) };
  }

  /**
   * Reattaches a returning phone to its player, if it still exists.
   * @param token The player's token.
   * @returns Their identity, or null if they're gone.
   */
  resume(token: string): PlayerIdentity | null {
    const player = this.players.get(token);
    if (!player) {
      return null;
    }
    player.connected = true;
    player.disconnectedAt = null;
    return this._game.views.identityOf(player);
  }

  /**
   * Who a token belongs to, for the TV's list of claimed controllers.
   * @param token The player's token.
   * @returns Their id, name, and color, or null.
   */
  playerOf(token: string): { id: string; name: string; color: string } | null {
    const p = this.players.get(token);
    return p ? { id: p.id, name: p.name, color: p.color } : null;
  }

  /**
   * Marks a player's phone as gone (put down, or the screen went off): they
   * slump where they stand, still in the game and still killable, until
   * the phone comes back or they leave.
   * @param token The player's token.
   */
  disconnect(token: string): void {
    const player = this.players.get(token);
    if (player) {
      player.connected = false;
      player.disconnectedAt = Date.now();
      player.inputX = 0;
      player.inputY = 0;
      player.actionHeld = false;
      player.aimX = 0;
      player.aimY = 0;
    }
  }

  /**
   * Removes a player immediately (see `remove`).
   * @param token The player's token.
   */
  leave(token: string): void {
    const player = this.players.get(token);
    if (player) {
      this.remove(player);
    }
  }

  /**
   * Takes a player out of the game, keeping what they carry and their
   * skill tree (and their id, so their coffin stays theirs) for when
   * someone joins again under the same name.
   * @param p The player.
   */
  private remove(p: Player): void {
    this._game.roster.departed.set(p.name.toLowerCase(), { id: p.id, inventory: p.inventory, bag: p.bag, tree: p.tree, onlineSeconds: p.onlineSeconds });
    this.players.delete(p.token);
  }
}
