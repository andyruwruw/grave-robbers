/**
 * Counts frames drawn per second, over the last second.
 */
export class FrameStats {
  /**
   * Frames drawn per second, over the last second.
   */
  fps = 0;

  /**
   * Frames drawn since `_fpsSince`.
   */
  private _frames = 0;

  /**
   * When (clock seconds) the count started.
   */
  private _fpsSince = 0;

  /**
   * Counts a frame, updating `fps` once a second has passed.
   * @param time Clock seconds.
   */
  tick(time: number): void {
    this._frames++;
    if (time - this._fpsSince >= 1) {
      this.fps = Math.round(this._frames / (time - this._fpsSince));
      this._frames = 0;
      this._fpsSince = time;
    }
  }
}
