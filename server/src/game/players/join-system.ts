// Packages
import { randomBytes, randomUUID } from 'node:crypto';
import { MAX_NAME_LENGTH, MAX_PLAYERS, PLAYER_COLORS } from '@halloween/shared/players/roster';

// Local Imports
import { GameSystem } from '../core/game-system';
import { playerSaveOf } from '../storage/helpers/player-save';
import { Player } from './player';
import { TransferCodes } from './transfer-codes';

// Types
import type { PlayerIdentity } from '@halloween/shared/protocol/state/player-state';
import type { PlayerSave } from '../storage/types/save';
import type { JoinResult } from '../types/players';

/**
 * Players coming and going: joining, a phone coming back or going away,
 * and leaving.
 */
export class JoinSystem extends GameSystem {
  /**
   * Codes that move a character to another device.
   */
  readonly transfers = new TransferCodes();

  /**
   * Joins a phone from its name and color pick. A new name makes a new
   * character. A name someone already has is theirs: the phone gets it
   * only with proof, a token it held for that character before (it
   * played it on this device) or a transfer code from the device that has
   * it; a character someone is playing right now can't be taken.
   * @param rawName The name typed on the phone.
   * @param color The color picked, one of PLAYER_COLORS.
   * @param proof Tokens this device held before, and a transfer code.
   * @returns Their identity, or why they can't join.
   */
  join(rawName: string, color: string, proof: { tokens: string[]; code: string }): JoinResult {
    const name = rawName.replace(/\s+/g, ' ').trim().slice(0, MAX_NAME_LENGTH);
    if (!name) {
      return { ok: false, error: 'Pick a name first.' };
    }
    if (!PLAYER_COLORS.includes(color)) {
      return { ok: false, error: 'Unknown color.' };
    }
    const holder = this._game.roster.holderOf(name);
    if (holder) {
      if (holder instanceof Player && holder.connected) {
        return { ok: false, error: `${holder.name} is being played right now.` };
      }
      if (!proof.tokens.includes(holder.token) && !this.transfers.redeem(proof.code, holder.id)) {
        return { ok: false, error: `${holder.name} belongs to someone. Enter the transfer code from their device.`, needsCode: true };
      }
      if (holder instanceof Player) {
        holder.color = color;
        return { ok: true, identity: this.resume(holder.token)! };
      }
      return { ok: true, identity: this.bringBack(holder, color) };
    }
    if (this.players.size >= MAX_PLAYERS) {
      return { ok: false, error: 'The graveyard is full.' };
    }
    const spawn = this._game.roster.randomSpawn();
    const player = new Player({ id: randomUUID(), token: randomBytes(18).toString('base64url'), name, color, x: spawn.x, y: spawn.y, time: this.world.time });
    this.players.set(player.token, player);
    return { ok: true, identity: this._game.views.identityOf(player) };
  }

  /**
   * Reattaches a returning phone to its player: one still in the game, or
   * a saved character it's bringing back (after it left, or a restart).
   * @param token The player's token.
   * @returns Their identity, or null if no character has that token.
   */
  resume(token: string): PlayerIdentity | null {
    const player = this.players.get(token);
    if (!player) {
      const saved = this._game.roster.awayByToken(token);
      return saved ? this.bringBack(saved, saved.color) : null;
    }
    player.connected = true;
    player.disconnectedAt = null;
    return this._game.views.identityOf(player);
  }

  /**
   * Puts a saved character back in the game where they were, with what
   * they had (at a spawn if they were dead or their spot is now solid).
   * @param saved The character.
   * @param color The color they come back in.
   * @returns Their identity.
   */
  private bringBack(saved: PlayerSave, color: string): PlayerIdentity {
    const map = this.world.map;
    const stuck = saved.hp <= 0 || map.isSolid(Math.floor(saved.x), Math.floor(saved.y));
    const at = stuck ? this._game.roster.randomSpawn() : { x: saved.x, y: saved.y };
    const player = new Player({ id: saved.id, token: saved.token, name: saved.name, color, x: at.x, y: at.y, time: this.world.time, back: saved });
    if (!stuck) {
      player.hp = Math.min(player.hp, saved.hp);
    }
    this._game.roster.away.delete(saved.id);
    this.players.set(player.token, player);
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
   * Takes a player out of the game into the saved characters, with all
   * they had and where they stood, for when their phone comes back (or a
   * device proves it may have them).
   * @param p The player.
   */
  private remove(p: Player): void {
    this._game.roster.putAway(playerSaveOf(p));
    this.players.delete(p.token);
  }

  /**
   * Deletes a character for good (the admin freeing their name): out of
   * the game if they're in it, and their save goes.
   * @param id The character's id.
   * @returns The token they had, or null if there was no such character.
   */
  release(id: string): string | null {
    const roster = this._game.roster;
    const online = [...this.players.values()].find((p: Player): boolean => p.id === id);
    const token = online?.token ?? roster.away.get(id)?.token ?? null;
    if (online) {
      this.players.delete(online.token);
    }
    roster.away.delete(id);
    roster.changed.delete(id);
    if (token) {
      roster.released.add(id);
    }
    return token;
  }
}
