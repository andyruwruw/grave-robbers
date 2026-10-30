// Local Imports
import { BLINK_FADE } from './config/monster-motion';

/**
 * A monster's shadow steps (a demon vanishing and reappearing elsewhere):
 * restarted each time the server counts a new one.
 */
export class ShadowBlink {
  /**
   * Seconds since the last shadow step (BLINK_FADE once settled).
   */
  age = BLINK_FADE;

  /**
   * Starts counting from the server's tally.
   * @param _count Shadow steps seen so far.
   */
  constructor(private _count: number) {}

  /**
   * Restarts on a new shadow step and ages it.
   * @param dt Seconds since the last frame.
   * @param count The server's tally of shadow steps.
   * @returns Whether it stepped this frame (so it should snap to where the
   * server says, instead of easing there).
   */
  update(dt: number, count: number): boolean {
    const stepped = count !== this._count;
    if (stepped) {
      this._count = count;
      this.age = 0;
    }
    this.age = Math.min(this.age + dt, BLINK_FADE);
    return stepped;
  }
}
