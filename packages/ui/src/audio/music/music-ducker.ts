// Local Imports
import {
  DUCK_RELEASE,
  DUCK_STEPS,
} from '../../config/audio';

/**
 * Dips the music under big sound effects and eases it back.
 */
export class MusicDucker {
  /**
   * The share of the music's volume playing now, 0..1.
   */
  level = 1;

  /**
   * The steps of the duck coming back up.
   */
  private _timers: ReturnType<typeof setTimeout>[] = [];

  /**
   * Makes a ducker for one player.
   *
   * @param _apply - Applies `level` to whatever plays.
   */
  constructor(private readonly _apply: () => void) {}

  /**
   * Dips the music to `depth` of its volume for `hold` seconds, then fades
   * it back.
   *
   * @param depth - The share of the volume to dip to.
   * @param hold - Seconds to stay down.
   */
  duck(depth: number, hold: number): void {
    this._timers.forEach(clearTimeout);
    this.level = Math.min(this.level, depth);
    this._apply();
    this._timers = Array.from({ length: DUCK_STEPS }, (_, i: number) => setTimeout((): void => {
      this.level = depth + (1 - depth) * ((i + 1) / DUCK_STEPS);
      this._apply();
    }, (hold + (DUCK_RELEASE * (i + 1)) / DUCK_STEPS) * 1000));
  }

  /**
   * Cancels a duck coming back up.
   */
  dispose(): void {
    this._timers.forEach(clearTimeout);
  }
}
