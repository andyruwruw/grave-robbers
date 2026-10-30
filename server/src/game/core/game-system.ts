// Types
import type { GameSettings } from '@halloween/shared/protocol/game-settings';
import type { Game } from '../game';
import type { Horde } from '../horde/horde';
import type { Player } from '../players/player';
import type { World } from '../world/world';
import type { Outbox } from './outbox';

/**
 * One part of the game. Parts hold the game and read its shared state
 * through it live, never keeping copies: `reset` replaces the world.
 * Constructors only store the game; they run while Game is still being
 * built, before its world exists.
 */
export abstract class GameSystem {
  /**
   * Sets the part up on the game.
   * @param _game The game it belongs to.
   */
  constructor(protected readonly _game: Game) {}

  /**
   * The map and everything on it.
   * @returns The game's current world.
   */
  protected get world(): World {
    return this._game.world;
  }

  /**
   * Every monster.
   * @returns The game's horde.
   */
  protected get horde(): Horde<Player> {
    return this._game.horde;
  }

  /**
   * Everyone in the game, by token.
   * @returns The roster's live map.
   */
  protected get players(): Map<string, Player> {
    return this._game.roster.players;
  }

  /**
   * What the hub drains after each step.
   * @returns The game's outbox.
   */
  protected get outbox(): Outbox {
    return this._game.outbox;
  }

  /**
   * The TV's Game tab switches.
   * @returns The game's settings.
   */
  protected get settings(): GameSettings {
    return this._game.settings;
  }
}
