// Packages
import {
  Quaternion,
  Vector3,
} from 'three';

// Types
import type { Group } from 'three';

/**
 * Pendulum stiffness and damping: low damping keeps it swinging a few
 * times after a stop. FLING turns the hold point's acceleration into swing.
 */
const STIFFNESS = 38;

/**
 * How fast the swing dies down (see STIFFNESS).
 */
const DAMPING = 2.6;

/**
 * How much of the hold point's acceleration turns into swing.
 */
const FLING = 0.09;

/**
 * Furthest it tilts either way, in radians.
 */
const MAX_TILT = 1.1;

/**
 * The world x axis, tilted about for swings along z.
 */
const X_AXIS = new Vector3(1, 0, 0);

/**
 * The world z axis, tilted about for swings along x.
 */
const Z_AXIS = new Vector3(0, 0, 1);

/**
 * Scratch tilt about x, reused every frame.
 */
const tiltX = new Quaternion();

/**
 * Scratch tilt about z, reused every frame.
 */
const tiltZ = new Quaternion();

/**
 * Scratch pivot offset, reused every frame.
 */
const offset = new Vector3();

/**
 * Something held up by the TV's mouse, swinging like a rag doll from the
 * point it's held by: it lags behind when dragged, swings past when the
 * mouse stops, and wobbles a little even when held still.
 */
export class Dangle {
  /**
   * Current tilt along x, in radians.
   */
  private _swingX = 0;

  /**
   * Current tilt along z, in radians.
   */
  private _swingZ = 0;

  /**
   * How fast the tilt along x is changing.
   */
  private _spinX = 0;

  /**
   * How fast the tilt along z is changing.
   */
  private _spinZ = 0;

  /**
   * The hold point's x last frame, or null before the first.
   */
  private _lastX: number | null = null;

  /**
   * The hold point's z last frame.
   */
  private _lastZ = 0;

  /**
   * The hold point's velocity along x last frame.
   */
  private _velX = 0;

  /**
   * The hold point's velocity along z last frame.
   */
  private _velZ = 0;

  /**
   * Steps the swing for a hold point now at (x, z) in scene units.
   * @param dt Seconds since the last frame.
   * @param x The hold point's world x.
   * @param z The hold point's world z.
   */
  update(dt: number, x: number, z: number): void {
    const step = Math.max(dt, 1e-3);
    if (this._lastX === null) {
      this._lastX = x;
      this._lastZ = z;
    }
    const velX = (x - this._lastX) / step;
    const velZ = (z - this._lastZ) / step;
    const accX = (velX - this._velX) / step;
    const accZ = (velZ - this._velZ) / step;
    this._lastX = x;
    this._lastZ = z;
    this._velX = velX;
    this._velZ = velZ;
    this._spinX += (-STIFFNESS * Math.sin(this._swingX) - DAMPING * this._spinX - accX * FLING) * step;
    this._spinZ += (-STIFFNESS * Math.sin(this._swingZ) - DAMPING * this._spinZ - accZ * FLING) * step;
    this._swingX = Math.max(-MAX_TILT, Math.min(MAX_TILT, this._swingX + this._spinX * step));
    this._swingZ = Math.max(-MAX_TILT, Math.min(MAX_TILT, this._swingZ + this._spinZ * step));
  }

  /**
   * Tilts `group` (already posed upright, facing its way) around a point
   * `pivot` above its feet, by `amount` (0 resting on the ground, 1 fully
   * held up), with a small idle wobble.
   * @param group The thing being held.
   * @param pivot Height above its feet it hangs from.
   * @param amount How held up it is, 0..1.
   * @param time Seconds since the renderer started.
   */
  apply(group: Group, pivot: number, amount: number, time: number): void {
    const wobble = Math.sin(time * 4.3) * 0.08;
    const x = (this._swingX + wobble) * amount;
    const z = (this._swingZ + Math.cos(time * 3.1) * 0.06) * amount;
    tiltZ.setFromAxisAngle(Z_AXIS, x);
    tiltX.setFromAxisAngle(X_AXIS, -z);
    tiltZ.multiply(tiltX);
    const yaw = group.rotation.y;
    group.rotation.set(0, yaw, 0);
    group.quaternion.premultiply(tiltZ);
    offset.set(0, -pivot, 0).applyQuaternion(tiltZ);
    group.position.y += pivot;
    group.position.add(offset);
  }
}
