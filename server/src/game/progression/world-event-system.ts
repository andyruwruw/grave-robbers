// Packages
import { effectOf, resolveEffects } from '@halloween/shared/world-events/helpers/resolve-effects';
import { WORLD_EVENTS, WORLD_EVENT_KINDS } from '@halloween/shared/world-events/world-event-catalog';

// Local Imports
import { GameSystem } from '../core/game-system';

// Types
import type { EventModifiers } from '@halloween/shared/world-events/types/event-effects';
import type { WorldEventKind, WorldEventState } from '@halloween/shared/world-events/types/world-events';
import type { Game } from '../game';
import type { Player } from '../players/player';

/**
 * World events (the blood moon, and any others in `WORLD_EVENTS`): the
 * calm before each one that comes on its own, the ones that are up, and
 * their effects combined into `modifiers` for the other systems to read.
 */
export class WorldEventSystem extends GameSystem {
  /**
   * Seconds left of each event that's up.
   */
  private readonly _left = new Map<WorldEventKind, number>();

  /**
   * For each event that comes on its own: seconds of calm so far, and how
   * long this calm lasts.
   */
  private readonly _calm = new Map<WorldEventKind, { so: number; until: number }>();

  /**
   * Every event that's up, combined.
   */
  private _modifiers: EventModifiers = resolveEffects([]);

  /**
   * Rolls the first calm before each event that comes on its own.
   * @param game The game.
   */
  constructor(game: Game) {
    super(game);
    for (const kind of WORLD_EVENT_KINDS) {
      if (WORLD_EVENTS[kind].every) {
        this._calm.set(kind, { so: 0, until: this.rollCalm(kind) });
      }
    }
  }

  /**
   * Every event that's up, combined, for the other systems to read.
   * @returns The modifiers.
   */
  get modifiers(): EventModifiers {
    return this._modifiers;
  }

  /**
   * Every event that's up.
   * @returns Their states.
   */
  active(): WorldEventState[] {
    return [...this._left].map(([kind, left]): WorldEventState => ({ kind, left: Math.ceil(left) }));
  }

  /**
   * Starts an event right now (or restarts it), runs its start effects,
   * and restarts the calm before it comes again. The TV's Game tab calls
   * this too, even with nobody playing.
   * @param kind The event.
   */
  start(kind: WorldEventKind): void {
    this._left.set(kind, WORLD_EVENTS[kind].duration);
    const calm = this._calm.get(kind);
    if (calm) {
      calm.so = 0;
      calm.until = this.rollCalm(kind);
    }
    const blackout = effectOf(kind, 'blackout');
    if (blackout) {
      this.world.lights.blackout(blackout.within, blackout.sputter);
    }
    this.resolve();
  }

  /**
   * Puts out lights as a blackout reaches them, counts down the events
   * that are up, and the calm before each one that isn't, which only
   * passes while someone is connected and monsters spawn.
   * @param dt Seconds since the last step.
   */
  advance(dt: number): void {
    for (const { tx, ty } of this.world.lights.stepBlackout()) {
      this.outbox.events.push({ t: 'snuff', tx, ty });
    }
    for (const [kind, left] of this._left) {
      if (left <= dt) {
        this._left.delete(kind);
        this.resolve();
      } else {
        this._left.set(kind, left - dt);
      }
    }
    if (!this.settings.spawning || ![...this.players.values()].some((p: Player): boolean => p.connected)) {
      return;
    }
    for (const [kind, calm] of this._calm) {
      if (!this._left.has(kind)) {
        calm.so += dt;
        if (calm.so >= calm.until) {
          this.start(kind);
        }
      }
    }
  }

  /**
   * Ends every event and restarts each calm (their lengths aren't
   * rerolled).
   */
  reset(): void {
    this._left.clear();
    for (const calm of this._calm.values()) {
      calm.so = 0;
    }
    this.resolve();
  }

  /**
   * Combines the effects of every event that's up.
   */
  private resolve(): void {
    this._modifiers = resolveEffects([...this._left.keys()].map((kind: WorldEventKind) => ({ kind, weight: 1 })));
  }

  /**
   * How long the calm before an event lasts this time.
   * @param kind The event.
   * @returns Seconds.
   */
  private rollCalm(kind: WorldEventKind): number {
    const every = WORLD_EVENTS[kind].every!;
    return every.min + Math.random() * every.spread;
  }
}
