// Local Imports
import { STUMBLE_TIME } from './config/monster-motion';

/**
 * A monster's stumbles: restarted each time the server counts a new one,
 * pitching to a random side.
 */
export class Stumble {
  /**
   * Seconds into the current stumble.
   */
  age = STUMBLE_TIME;

  /**
   * Which way the current stumble pitches, -1 or 1.
   */
  side = 1;

  /**
   * Starts counting from the server's tally.
   * @param _count Stumbles seen so far.
   */
  constructor(private _count: number) {}

  /**
   * Restarts on a new stumble and ages it.
   * @param dt Seconds since the last frame.
   * @param count The server's tally of stumbles.
   * @returns How far into the stumble, 0 to 1 (a quick buckle that eases
   * back).
   */
  update(dt: number, count: number): number {
    if (count !== this._count) {
      this._count = count;
      this.age = 0;
      this.side = Math.random() < 0.5 ? -1 : 1;
    }
    this.age = Math.min(this.age + dt, STUMBLE_TIME);
    const s = this.age / STUMBLE_TIME;
    return s < 1 ? Math.sin(Math.min(1, s * 2.5) * Math.PI / 2) * (1 - s) : 0;
  }
}
