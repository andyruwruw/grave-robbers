// Types
import type { SoundStage } from '../sound-stage';
import type { StateMessage } from '../../types/sound';

/**
 * One part of the TV's sound: watches each snapshot for what it plays.
 */
export abstract class SoundWatcher {
  /**
   * Plays through the shared stage.
   *
   * @param _stage - The map, the sound engine, and the music.
   */
  constructor(protected readonly _stage: SoundStage) {}

  /**
   * Plays what changed in this snapshot.
   *
   * @param msg - The snapshot.
   * @param now - The snapshot's arrival time in seconds.
   */
  abstract onState(msg: StateMessage, now: number): void;
}
