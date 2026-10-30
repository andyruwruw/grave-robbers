// Local Imports
import { LUNGE_TIME, ZOMBIE_ATTACK_TIME } from './config/monster-motion';

/**
 * Times a monster's attacks: restarted each time the server counts a new
 * one, through the windup (the server's telegraph), the lunge, and the
 * rest of the attack.
 */
export class AttackClock {
  /**
   * Seconds into the lunge (negative through the windup).
   */
  private _lungeAge = LUNGE_TIME;

  /**
   * How long one attack plays (set by the kind once built).
   */
  time = ZOMBIE_ATTACK_TIME;

  /**
   * Seconds into the current attack.
   */
  age = ZOMBIE_ATTACK_TIME;

  /**
   * How far into the lunge, 0 to 1, this frame.
   */
  lunge = 0;

  /**
   * How far through the windup, 0 to 1, this frame.
   */
  coil = 0;

  /**
   * Starts counting from the server's tally.
   * @param _count Attacks seen so far.
   * @param windup This kind's windup, the server's telegraph.
   */
  constructor(private _count: number, readonly windup: number) {}

  /**
   * Sets how long one attack plays, and finishes the current one.
   * @param time Seconds.
   */
  setDuration(time: number): void {
    this.time = time;
    this.age = time;
  }

  /**
   * Restarts on a new attack, ages it, and works out the lunge and coil.
   * @param dt Seconds since the last frame.
   * @param count The server's tally of attacks.
   * @returns Whether a new attack started this frame.
   */
  update(dt: number, count: number): boolean {
    const started = count !== this._count;
    if (started) {
      this._count = count;
      this._lungeAge = -this.windup;
      this.age = 0;
    }
    this._lungeAge = Math.min(this._lungeAge + dt, LUNGE_TIME);
    this.age = Math.min(this.age + dt, this.time);
    this.lunge = this._lungeAge > 0 ? Math.sin((this._lungeAge / LUNGE_TIME) * Math.PI) : 0;
    this.coil = this._lungeAge < 0 && this.windup > 0 ? 1 + this._lungeAge / this.windup : 0;
    return started;
  }
}
