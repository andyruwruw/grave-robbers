// Local Imports
import { FIGHT_LINGER, FIGHT_RANGE } from '../../config/sound';
import { SoundWatcher } from './sound-watcher';

// Types
import type { MonsterState } from '@halloween/shared/protocol/state/monster-state';
import type { PlayerState } from '@halloween/shared/protocol/state/player-state';
import type { StateMessage } from '../../types/sound';

/**
 * The blood moon's toll as it rises (ducking the music), and the music's
 * mood: whether anyone's playing, whether there's a fight (a monster near a
 * living player, or a recent hit), and the blood moon.
 */
export class MoodWatcher extends SoundWatcher {
  /**
   * Whether the blood moon was up in the last snapshot (null before the
   * first).
   */
  private _bloodMoon: boolean | null = null;

  /**
   * Tolls a rising blood moon and sets the music's mood.
   *
   * @param msg - The snapshot.
   * @param now - The snapshot's arrival time in seconds.
   */
  onState(msg: StateMessage, now: number): void {
    if (this._bloodMoon === false && msg.bloodMoon) {
      this._stage.sfx.play('blood-moon');
      this._stage.music.duck(0.25, 3);
    }
    this._bloodMoon = msg.bloodMoon;
    const alive = msg.players.filter((p: PlayerState): boolean => p.connected && !p.dead);
    const near = msg.monsters.some((m: MonsterState): boolean => alive.some((p: PlayerState): boolean => Math.hypot(m.x - p.x, m.y - p.y) < FIGHT_RANGE));
    this._stage.music.setMood({
      players: msg.players.some((p: PlayerState): boolean => p.connected),
      fight: near || now - this._stage.lastHitAt < FIGHT_LINGER,
      bloodMoon: msg.bloodMoon,
    });
  }
}
