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
const DAMPING = 2.6;
const FLING = 0.09;
const MAX_TILT = 1.1;

const X_AXIS = new Vector3(1, 0, 0);
const Z_AXIS = new Vector3(0, 0, 1);
const tiltX = new Quaternion();
const tiltZ = new Quaternion();
const offset = new Vector3();

/**
 * Something held up by the TV's mouse, swinging like a rag doll from the
 * point it's held by: it lags behind when dragged, swings past when the
 * mouse stops, and wobbles a little even when held still.
 */
export class Dangle {
  private swingX = 0;
  private swingZ = 0;
  private spinX = 0;
  private spinZ = 0;
  private lastX: number | null = null;
  private lastZ = 0;
  private velX = 0;
  private velZ = 0;

  /**
   * Steps the swing for a hold point now at (x, z) in scene units.
   */
  update(dt: number, x: number, z: number): void {
    const step = Math.max(dt, 1e-3);
    if (this.lastX === null) {
      this.lastX = x;
      this.lastZ = z;
    }
    const velX = (x - this.lastX) / step;
    const velZ = (z - this.lastZ) / step;
    const accX = (velX - this.velX) / step;
    const accZ = (velZ - this.velZ) / step;
    this.lastX = x;
    this.lastZ = z;
    this.velX = velX;
    this.velZ = velZ;
    this.spinX += (-STIFFNESS * Math.sin(this.swingX) - DAMPING * this.spinX - accX * FLING) * step;
    this.spinZ += (-STIFFNESS * Math.sin(this.swingZ) - DAMPING * this.spinZ - accZ * FLING) * step;
    this.swingX = Math.max(-MAX_TILT, Math.min(MAX_TILT, this.swingX + this.spinX * step));
    this.swingZ = Math.max(-MAX_TILT, Math.min(MAX_TILT, this.swingZ + this.spinZ * step));
  }

  /**
   * Tilts `group` (already posed upright, facing its way) around a point
   * `pivot` above its feet, by `amount` (0 resting on the ground, 1 fully
   * held up), with a small idle wobble.
   */
  apply(group: Group, pivot: number, amount: number, time: number): void {
    const wobble = Math.sin(time * 4.3) * 0.08;
    const x = (this.swingX + wobble) * amount;
    const z = (this.swingZ + Math.cos(time * 3.1) * 0.06) * amount;
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
