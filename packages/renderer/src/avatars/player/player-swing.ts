// Packages
import { GEAR } from '@halloween/shared/gear/gear-catalog';
import { applyInfusion } from '@halloween/shared/gear/infusions/helpers/apply-infusion';
import { STRIKE_DELAY } from '@halloween/shared/players/combat';

// Local Imports
import { COIL_IN, PREDICTED_SWING_WAIT, SWING_TIME } from './config/player-timing';

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
   * Seconds since the last swing ended (it starts long rested).
   */
  rested = Infinity;

  /**
   * How far the morning star was coiled when this swing started, 0 to 1.
   */
  from = 1;

  /**
   * How long the last swing of what's in hand took, in seconds.
   */
  private _duration = SWING_TIME;

  /**
   * Swings started here before the server's, as the time each stops
   * waiting for the server to confirm it.
   */
  private _predicted: number[] = [];

  /**
   * The weapon (kind and infusion) `_windup` was worked out for.
   */
  private _windupOf = '';

  /**
   * That weapon's windup, in seconds.
   */
  private _windup = STRIKE_DELAY;

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
    this.restart();
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
    const next = this.age + dt;
    if (next > duration) {
      this.rested += next - Math.max(this.age, duration);
    }
    this.age = Math.min(next, duration);
    this._duration = duration;
    return duration;
  }

  /**
   * Starts a swing now, ahead of the server; the server's matching swing,
   * if it comes within PREDICTED_SWING_WAIT, then doesn't start it over.
   * @param time Seconds since the renderer started.
   */
  predict(time: number): void {
    this.restart();
    this._predicted.push(time + PREDICTED_SWING_WAIT);
  }

  /**
   * How far through the swing for the morning star's whip, running on past
   * 1 (in swing lengths) while it rests so it can coil back up.
   * @returns The phase.
   */
  curlPhase(): number {
    return this.age < this._duration ? this.age / this._duration : 1 + this.rested / this._duration;
  }

  /**
   * How far the whip has wound back into its coil, 0 to 1.
   * @returns The amount, eased.
   */
  coil(): number {
    const c = Math.min(1, Math.max(0, this.curlPhase() - 1) / COIL_IN);
    return c * c * (3 - 2 * c);
  }

  /**
   * Starts a swing from the top, noting how coiled the whip was.
   */
  private restart(): void {
    this.from = this.coil();
    this.age = 0;
    this.rested = 0;
  }

  /**
   * How long a swing of what's in hand takes: slow, heavy weapons wind up
   * longer (as infused, so Feral's quicker windup shows), so the blow still
   * lands when the server's does; one that skipped its windup (Headsman's
   * Axe) plays at the plain pace.
   * @param t The player's state.
   * @returns Seconds.
   */
  private duration(t: PlayerState): number {
    const kind = t.drawn ?? t.gear.weapon;
    if (!kind || (!t.drawn && t.quickSwing)) {
      return SWING_TIME;
    }
    const infusion = t.drawn ? null : t.gearInfusion.weapon ?? null;
    const key = infusion ? `${kind}@${infusion.essence}${infusion.level}` : kind;
    if (key !== this._windupOf) {
      const base = GEAR[kind].weapon;
      const stats = base ? { ...base } : null;
      if (stats) {
        applyInfusion(stats, kind, infusion);
      }
      this._windupOf = key;
      this._windup = stats?.windup ?? STRIKE_DELAY;
    }
    return SWING_TIME * this._windup / STRIKE_DELAY;
  }
}
