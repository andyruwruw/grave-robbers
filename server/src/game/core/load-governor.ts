// Local Imports
import {
  LOAD_DROP,
  LOAD_HIGH_MS,
  LOAD_LOW_MS,
  LOAD_MIN_SCALE,
  LOAD_RISE,
  LOAD_SEVERE_MS,
  LOAD_SHED,
} from '../../config/server';

/**
 * Keeps the server's ticks on time when the world gets heavy: it watches
 * how long each tick takes (smoothed), and once a second lowers the share
 * of the monster caps spawning fills while ticks run slow (LOAD_HIGH_MS),
 * asks for monsters to be shed while they run past their whole budget
 * (LOAD_SEVERE_MS), and lets the caps creep back once ticks are fast again
 * (LOAD_LOW_MS).
 */
export class LoadGovernor {
  /**
   * Share of the monster caps spawning may fill, LOAD_MIN_SCALE to 1.
   */
  scale = 1;

  /**
   * Smoothed ms a tick takes.
   */
  private _avgMs = 0;

  /**
   * Seconds since it last adjusted.
   */
  private _since = 0;

  /**
   * Monsters it wants removed, taken by `takeShed`.
   */
  private _shed = 0;

  /**
   * Notes how long one tick's steps took.
   * @param ms Wall time the steps took.
   * @param steps How many fixed steps that was.
   * @param dt Seconds each step covers.
   */
  observe(ms: number, steps: number, dt: number): void {
    const perStep = ms / Math.max(1, steps);
    this._avgMs += (perStep - this._avgMs) * 0.1;
    this._since += steps * dt;
    if (this._since < 1) {
      return;
    }
    this._since = 0;
    const was = this.scale;
    if (this._avgMs > LOAD_HIGH_MS) {
      this.scale = Math.max(LOAD_MIN_SCALE, this.scale - LOAD_DROP);
    } else if (this._avgMs < LOAD_LOW_MS) {
      this.scale = Math.min(1, this.scale + LOAD_RISE);
    }
    if (this._avgMs > LOAD_SEVERE_MS) {
      this._shed += LOAD_SHED;
    }
    if (Math.abs(this.scale - was) >= LOAD_DROP - 1e-9 || (this.scale === 1 && was < 1)) {
      console.log(`[load] ticks take ${this._avgMs.toFixed(1)} ms: monster caps at ${Math.round(this.scale * 100)}%`);
    }
  }

  /**
   * Hands over the monsters it wants shed, and forgets them.
   * @returns How many.
   */
  takeShed(): number {
    const n = this._shed;
    this._shed = 0;
    return n;
  }
}
