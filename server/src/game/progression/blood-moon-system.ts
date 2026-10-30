// Packages
import {
  BLOOD_MOON_CALM,
  BLOOD_MOON_CALM_SPREAD,
  BLOOD_MOON_DURATION,
} from '@halloween/shared/monsters/blood-moon';

// Local Imports
import { GameSystem } from '../core/game-system';

// Types
import type { Player } from '../players/player';

/**
 * The blood moon: the calm before it, and how long it lasts.
 */
export class BloodMoonSystem extends GameSystem {
  /**
   * Seconds left of the blood moon in progress (0: none).
   */
  private _bloodMoonLeft = 0;

  /**
   * Seconds of calm since the last blood moon.
   */
  private _calm = 0;

  /**
   * How long this calm lasts.
   */
  private _calmTarget = BLOOD_MOON_CALM + Math.random() * BLOOD_MOON_CALM_SPREAD;

  /**
   * Whether a blood moon is up.
   * @returns True while one is up.
   */
  bloodMoon(): boolean {
    return this._bloodMoonLeft > 0;
  }

  /**
   * Raises a blood moon right now and restarts the calm before the next.
   * The TV's summon button calls this too, even with nobody playing.
   */
  forceBloodMoon(): void {
    this._bloodMoonLeft = BLOOD_MOON_DURATION;
    this._calm = 0;
    this._calmTarget = BLOOD_MOON_CALM + Math.random() * BLOOD_MOON_CALM_SPREAD;
  }

  /**
   * Counts down a blood moon in progress, or the calm before the next one,
   * which only passes while someone is connected.
   * @param dt Seconds since the last step.
   */
  advanceBloodMoon(dt: number): void {
    if (this._bloodMoonLeft > 0) {
      this._bloodMoonLeft = Math.max(0, this._bloodMoonLeft - dt);
      return;
    }
    if (this.settings.spawning && [...this.players.values()].some((p: Player): boolean => p.connected)) {
      this._calm += dt;
      if (this._calm >= this._calmTarget) {
        this.forceBloodMoon();
      }
    }
  }

  /**
   * Ends any blood moon and restarts the calm before the next (the
   * calm's length isn't rerolled).
   */
  reset(): void {
    this._bloodMoonLeft = 0;
    this._calm = 0;
  }
}
