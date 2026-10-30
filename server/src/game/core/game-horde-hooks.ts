// Local Imports
import { GameSystem } from './game-system';

// Types
import type { GameEvent } from '@halloween/shared/protocol/game-events';
import type { HordeHooks, HostileShot } from '../horde/types/hooks';
import type { Player } from '../players/player';

/**
 * How the horde reaches back into the game: its shots, its hits on
 * players, and its events each go to the system that owns them. The
 * horde calls these as `hooks.x()`, so plain methods keep their `this`.
 */
export class GameHordeHooks extends GameSystem implements HordeHooks<Player> {
  /**
   * A monster loosed something hostile.
   * @param x Where it is fired from (tiles across).
   * @param y Where it is fired from (tiles down).
   * @param angle Which way it flies (radians).
   * @param shot What flies.
   */
  shoot(x: number, y: number, angle: number, shot: HostileShot): void {
    this._game.shots.fireHostile(x, y, angle, shot);
  }

  /**
   * A monster hit a player.
   * @param p The player.
   * @param amount The damage before guarding.
   * @param by The monster's name for the kill feed.
   * @param fromX Where the hit came from (tiles across).
   * @param fromY Where the hit came from (tiles down).
   * @param knockback How far it knocks them back (tiles), or the default.
   * @param slow Seconds it slows them, if it does.
   * @returns The thorns damage their armor hits back with.
   */
  hurt(p: Player, amount: number, by: string, fromX: number, fromY: number, knockback?: number, slow?: number): number {
    return this._game.damage.hurtByMonster(p, amount, by, fromX, fromY, knockback, slow);
  }

  /**
   * Something happened in the horde.
   * @param e The event.
   * @param bled Who gets a bleed's kill, when it wasn't a hit landing now.
   */
  event(e: GameEvent, bled?: Player): void {
    this._game.spoils.onEvent(e, bled);
  }
}
