// Packages
import { effectOf, resolveEffects } from '@halloween/shared/world-events/helpers/resolve-effects';

// Local Imports
import { FIGHT_LINGER, FIGHT_RANGE } from '../../config/sound';
import { SoundWatcher } from './sound-watcher';

// Types
import type { MonsterState } from '@halloween/shared/protocol/state/monster-state';
import type { PlayerState } from '@halloween/shared/protocol/state/player-state';
import type { WorldEventKind, WorldEventState } from '@halloween/shared/world-events/types/world-events';
import type { StateMessage } from '../../types/sound';

/**
 * Each world event's announcement as it starts (a sound, ducking the
 * music), and the music's mood: whether anyone's playing, whether there's
 * a fight (a monster near a living player, or a recent hit), and the
 * drums world events keep going.
 */
export class MoodWatcher extends SoundWatcher {
  /**
   * The world events up in the last snapshot (null before the first, so
   * joining mid-event doesn't announce it).
   */
  private _events: WorldEventKind[] | null = null;

  /**
   * Announces world events as they start and sets the music's mood.
   *
   * @param msg - The snapshot.
   * @param now - The snapshot's arrival time in seconds.
   */
  onState(msg: StateMessage, now: number): void {
    const events = msg.worldEvents.map((e: WorldEventState): WorldEventKind => e.kind);
    for (const kind of events) {
      const announce = this._events && !this._events.includes(kind) ? effectOf(kind, 'announce') : undefined;
      if (announce) {
        this._stage.sfx.play(announce.sound);
        this._stage.music.duck(announce.duck, announce.seconds);
      }
    }
    this._events = events;
    const alive = msg.players.filter((p: PlayerState): boolean => p.connected && !p.dead);
    const near = msg.monsters.some((m: MonsterState): boolean => alive.some((p: PlayerState): boolean => Math.hypot(m.x - p.x, m.y - p.y) < FIGHT_RANGE));
    this._stage.music.setMood({
      players: msg.players.some((p: PlayerState): boolean => p.connected),
      fight: near || now - this._stage.lastHitAt < FIGHT_LINGER,
      drums: resolveEffects(events.map((kind: WorldEventKind) => ({ kind, weight: 1 }))).drums,
    });
  }
}
