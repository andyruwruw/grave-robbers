// Local Imports
import {
  KICK_DAMPING,
  KICK_PITCH,
  KICK_RECOIL,
  KICK_STIFFNESS,
  KICK_YAW,
} from './config/monster-motion';

/**
 * A monster's hit reaction: damped springs that snap the head and rock the
 * body when a blow lands, then pull them back to rest.
 */
export class HitKick {
  /**
   * How far the head is kicked sideways, in radians.
   */
  yaw = 0;

  /**
   * Speed of the sideways kick.
   */
  private _yawSpeed = 0;

  /**
   * How far the head is kicked back, in radians.
   */
  pitch = 0;

  /**
   * Speed of the backward kick.
   */
  private _pitchSpeed = 0;

  /**
   * How far the body is rocked, in radians.
   */
  recoil = 0;

  /**
   * Speed of the rock.
   */
  private _recoilSpeed = 0;

  /**
   * A blow landed: the head snaps the way it was hit (back if struck from
   * the front, sideways from the side) and the body rocks.
   * @param rel The blow's direction relative to the facing, in radians.
   * @param heft How much the blow moves it (1 for a zombie).
   */
  knock(rel: number, heft: number): void {
    this._yawSpeed -= Math.sin(rel) * KICK_YAW * heft;
    this._pitchSpeed -= Math.cos(rel) * KICK_PITCH * heft;
    this._recoilSpeed -= Math.cos(rel) * KICK_RECOIL * heft;
  }

  /**
   * Pulls the springs back toward rest.
   * @param dt Seconds since the last frame.
   */
  step(dt: number): void {
    const step = Math.min(dt, 1 / 30);
    this._yawSpeed += (-KICK_STIFFNESS * this.yaw - KICK_DAMPING * this._yawSpeed) * step;
    this._pitchSpeed += (-KICK_STIFFNESS * this.pitch - KICK_DAMPING * this._pitchSpeed) * step;
    this._recoilSpeed += (-KICK_STIFFNESS * this.recoil - KICK_DAMPING * this._recoilSpeed) * step;
    this.yaw += this._yawSpeed * step;
    this.pitch += this._pitchSpeed * step;
    this.recoil += this._recoilSpeed * step;
  }
}
