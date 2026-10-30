// Types
import type { Game } from '../../game/game';
import type { ConnectionHub } from '../connection-hub';
import type { StatsWindow } from '../broadcast/stats-window';
import type { MusicOwner } from '../sessions/music-owner';
import type { PingTracker } from '../sessions/ping-tracker';
import type { SessionRegistry } from '../sessions/session-registry';
import type { PadRegistry } from '../pads/pad-registry';

/**
 * One part of the connection hub. Parts hold the hub and reach its other
 * parts through it live. Constructors only store the hub; they run while
 * the hub is still being built, before every part exists.
 */
export abstract class HubPart {
  /**
   * Sets the part up on the hub.
   * @param _hub The hub it belongs to.
   */
  constructor(protected readonly _hub: ConnectionHub) {}

  /**
   * The game the hub routes into.
   * @returns The hub's game.
   */
  protected get game(): Game {
    return this._hub.game;
  }

  /**
   * Every socket's session.
   * @returns The hub's session registry.
   */
  protected get sessions(): SessionRegistry {
    return this._hub.sessions;
  }

  /**
   * The TV's per-second stats and the bytes sent to displays.
   * @returns The hub's stats window.
   */
  protected get stats(): StatsWindow {
    return this._hub.stats;
  }

  /**
   * Every socket's round trip.
   * @returns The hub's ping tracker.
   */
  protected get pings(): PingTracker {
    return this._hub.pings;
  }

  /**
   * Which TV page plays the music.
   * @returns The hub's music owner.
   */
  protected get music(): MusicOwner {
    return this._hub.music;
  }

  /**
   * The game controllers plugged into TV pages.
   * @returns The hub's pad registry.
   */
  protected get pads(): PadRegistry {
    return this._hub.pads;
  }
}
