// Packages
import { MONSTERS } from '@halloween/shared/monsters/monster-stats';

// Local Imports
import { GAIT } from './config/monster-motion';

// Types
import type { MonsterKind } from '@halloween/shared/monsters/monster-kinds';

/**
 * A monster's walk cycle, kept in step with how fast it's really moving so
 * its legs don't churn at full speed while it ambles.
 */
export class MonsterGait {
  /**
   * Stride phase, also used to put idle motions out of step (starts
   * random).
   */
  phase = Math.random() * 10;

  /**
   * How fast it's really moving, tiles a second, smoothed.
   */
  private _pace = 0;

  /**
   * Measures this frame's pace and advances the stride while it moves.
   * @param dt Seconds since the last frame.
   * @param moved How far it moved this frame, in tiles.
   * @param moving Whether the server says it's moving.
   * @param kind Its kind (for its gait and speed).
   */
  step(dt: number, moved: number, moving: boolean, kind: MonsterKind): void {
    if (dt > 0) {
      this._pace += (moved / dt - this._pace) * Math.min(1, dt * 8);
    }
    if (moving) {
      this.phase += dt * GAIT[kind] * Math.min(1.3, Math.max(0.15, this._pace / MONSTERS[kind].speed));
    }
  }
}
