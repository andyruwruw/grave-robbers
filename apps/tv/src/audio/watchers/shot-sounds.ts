// Local Imports
import { SoundWatcher } from './sound-watcher';

// Types
import type { StateMessage } from '../../types/sound';

/**
 * Sounds for shots as they appear: ecto, arrows, and thrown potions.
 */
export class ShotSounds extends SoundWatcher {
  /**
   * The shots in the last snapshot.
   */
  private _shots = new Set<number>();

  /**
   * Plays each new shot.
   *
   * @param msg - The snapshot.
   */
  onState(msg: StateMessage): void {
    const shots = new Set<number>();
    for (const s of msg.shots) {
      shots.add(s.id);
      if (s.kind === 'ecto' && !this._shots.has(s.id)) {
        this._stage.play('ghost-shot', s.x, 0.8, 0.9 + Math.random() * 0.2);
      } else if (s.kind === 'arrow' && !this._shots.has(s.id)) {
        this._stage.play('shoot', s.x, 0.7, 1.3 + Math.random() * 0.2);
      } else if (s.kind === 'potion' && !this._shots.has(s.id)) {
        this._stage.play('swing', s.x, 0.6, 1.2);
      }
    }
    this._shots = shots;
  }
}
