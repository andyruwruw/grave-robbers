// Local Imports
import { HubPart } from '../core/hub-part';

// Types
import type { ServerStats } from '@halloween/shared/protocol/server-stats';

/**
 * The stats shown on the TV, worked out once a second from the ticks run,
 * the time they took, and the bytes sent to displays.
 */
export class StatsWindow extends HubPart {
  /**
   * The stats from the last full second.
   */
  current: ServerStats = { tps: 0, stepMs: 0, worldLevel: 0, levels: {}, displayKBps: 0, stocked: { tree: 0, hedge: 0, pumpkin: 0, chest: 0, rock: 0 } };

  /**
   * Bytes sent to displays this second.
   */
  private _sentBytes = 0;

  /**
   * Ticks run this second.
   */
  private _ticks = 0;

  /**
   * Time (ms) those ticks took.
   */
  private _stepTotal = 0;

  /**
   * When this second started.
   */
  private _windowStart = Date.now();

  /**
   * Counts bytes sent to displays.
   * @param bytes How many.
   */
  countSent(bytes: number): void {
    this._sentBytes += bytes;
  }

  /**
   * Adds the ticks that just ran, and refreshes the stats once a second
   * has gone by.
   * @param steps Ticks that just ran.
   * @param stepMs Time (ms) they took in all.
   */
  record(steps: number, stepMs: number): void {
    this._ticks += steps;
    this._stepTotal += stepMs;
    const now = Date.now();
    if (now - this._windowStart >= 1000) {
      this.current = {
        tps: Math.round((this._ticks * 1000) / (now - this._windowStart) * 10) / 10,
        stepMs: Math.round((this._stepTotal / this._ticks) * 100) / 100,
        worldLevel: Math.round(this.game.levels.worldLevel * 10) / 10,
        levels: this.game.levels.playerLevels(),
        displayKBps: Math.round((this._sentBytes / 1024 / ((now - this._windowStart) / 1000)) * 10) / 10,
        stocked: this.game.world.growth.stocked(),
      };
      this._ticks = 0;
      this._stepTotal = 0;
      this._sentBytes = 0;
      this._windowStart = now;
    }
  }
}
