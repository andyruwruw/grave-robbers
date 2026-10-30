// Packages
import { GEAR } from '@halloween/shared/gear/gear-catalog';
import { STRIKE_DELAY } from '@halloween/shared/players/combat';

// Local Imports
import { PREDICTED_SWING_WAIT, SWING_TIME } from './config/player-timing';

// Types
import type { PlayerState } from '@halloween/shared/protocol/state/player-state';
import type { SwingSeen } from './types/swing-seen';

/**
 * Times a player's swings: started when the server counts a new one, or
 * ahead of the server (/play's instant attacks), in which case the server's
 * matching swing doesn't start it over.
 */
export class PlayerSwing {
  /**
   * Seconds into the current swing.
   */
  age = SWING_TIME;

  /**
   * Swings started here before the server's, as the time each stops
   * waiting for the server to confirm it.
   */
  private _predicted: number[] = [];

  /**
   * Starts counting from the server's tally.
   * @param _swings Swings seen so far.
   */
  constructor(private _swings: number) {}

  /**
   * Notices a new swing in the server's tally, starting it unless it was
   * predicted.
   * @param t The player's state.
   * @param time Seconds since the renderer started.
   * @returns What the tally showed.
   */
  track(t: PlayerState, time: number): SwingSeen {
    this._predicted = this._predicted.filter((until: number): boolean => until > time);
    if (t.swings === this._swings) {
      return 'none';
    }
    const confirmed = t.swings > this._swings && this._predicted.length > 0;
    this._swings = t.swings;
    if (confirmed) {
      this._predicted.shift();
      return 'confirmed';
    }
    this.age = 0;
    return 'started';
  }

  /**
   * Ages the swing.
   * @param dt Seconds since the last frame.
   * @param t The player's state.
   * @returns How long a swing of what's in hand takes.
   */
  advance(dt: number, t: PlayerState): number {
    const duration = this.duration(t);
    this.age = Math.min(this.age + dt, duration);
    return duration;
  }

  /**
   * Starts a swing now, ahead of the server; the server's matching swing,
   * if it comes within PREDICTED_SWING_WAIT, then doesn't start it over.
   * @param time Seconds since the renderer started.
   */
  predict(time: number): void {
    this.age = 0;
    this._predicted.push(time + PREDICTED_SWING_WAIT);
  }

  /**
   * How long a swing of what's in hand takes: slow, heavy weapons wind up
   * longer, so the blow still lands when the server's does.
   * @param t The player's state.
   * @returns Seconds.
   */
  private duration(t: PlayerState): number {
    const kind = t.drawn ?? t.gear.weapon;
    return SWING_TIME * (kind ? GEAR[kind].weapon?.windup ?? STRIKE_DELAY : STRIKE_DELAY) / STRIKE_DELAY;
  }
}
