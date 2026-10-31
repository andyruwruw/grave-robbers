// Local Imports
import { angleDelta } from '../../helpers/angles';
import {
  MAX_TURN_SPEED,
  TURN_DAMPING,
  TURN_FREQUENCY,
  TURN_SUBSTEP,
} from './config/player-turn';

/**
 * Turns a player's model toward their facing like a spring: it can't turn
 * faster than its max speed (MAX_TURN_SPEED unless the Turn speed setting
 * says otherwise), lags a moment behind, and a quick turn
 * swings slightly past and bounces back (TURN_DAMPING), more the faster it
 * was turning.
 */
export class PlayerTurn {
  /**
   * The model's facing, in radians.
   */
  facing = 0;

  /**
   * The fastest it may turn, in radians a second (the Turn speed setting,
   * `DisplaySettings.turnSpeed`).
   */
  maxSpeed = MAX_TURN_SPEED;

  /**
   * How fast it's turning, in radians a second.
   */
  private _speed = 0;

  /**
   * Faces `facing` at once, still (a fresh or respawned player).
   * @param facing The facing.
   */
  snap(facing: number): void {
    this.facing = facing;
    this._speed = 0;
  }

  /**
   * Turns toward a facing over a frame.
   * @param dt Seconds since the last frame.
   * @param target The facing to turn toward.
   * @returns The model's facing now.
   */
  step(dt: number, target: number): number {
    let left = dt;
    while (left > 0) {
      const slice = Math.min(TURN_SUBSTEP, left);
      left -= slice;
      const pull = TURN_FREQUENCY * TURN_FREQUENCY * angleDelta(this.facing, target) - 2 * TURN_DAMPING * TURN_FREQUENCY * this._speed;
      this._speed = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, this._speed + pull * slice));
      this.facing += this._speed * slice;
    }
    return this.facing;
  }
}
