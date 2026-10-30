// Packages
import { PLAYER_SPEED } from '@halloween/shared/players/movement';

// Local Imports
import { RUN_LEAN, SIDE_LEAN } from './config/player-poses';
import {
  JUMP_HOP,
  JUMP_TIME,
  LAND_TIME,
  RUN_SMOOTHING,
  SLUMP_SPEED,
  SUPER_HOP,
} from './config/player-timing';

// Types
import type { Group } from 'three';
import type { PlayerState } from '@halloween/shared/protocol/state/player-state';
import type { PlayerRig } from './player-rig';

/**
 * A hop in progress.
 */
interface Jump {
  /**
   * Seconds since it started.
   */
  age: number;

  /**
   * The height it started from.
   */
  from: number;

  /**
   * How high it hops.
   */
  hop: number;
}

/**
 * How a player moves on its feet: hops off ledges, lands with a squash,
 * runs (tipping into the direction of travel, lengthening and lifting the
 * stride), and slumps when its phone goes away. Each frame's results are
 * left in its fields for the rest of the update to read.
 */
export class PlayerLocomotion {
  /**
   * Measured velocity, tiles a second, smoothed.
   */
  private _velocity = { x: 0, y: 0 };

  /**
   * Speed along the facing, -1 to 1 of a full run.
   */
  run = 0;

  /**
   * Speed across the facing, -1 to 1 of a full run.
   */
  side = 0;

  /**
   * The walk cycle's phase.
   */
  walkPhase = 0;

  /**
   * Ground height last frame, to notice stepping off a ledge.
   */
  private _lastGround: number | null = null;

  /**
   * The hop in progress, if any.
   */
  private _jump: Jump | null = null;

  /**
   * Seconds since landing.
   */
  private _landAge = LAND_TIME;

  /**
   * How far slumped, 0 to 1.
   */
  private _slump = 0;

  /**
   * This frame's tuck from a hop, 0 to 1.
   */
  jumpPose = 0;

  /**
   * This frame's landing squash, 0 to 1.
   */
  squash = 0;

  /**
   * This frame's stride, -1 to 1.
   */
  stride = 0;

  /**
   * This frame's speed, 0 to 1 of a full run.
   */
  speed = 0;

  /**
   * This frame's slump, eased, 0 to 1.
   */
  slumpPose = 0;

  /**
   * Starts a hop off a ledge when the ground drops away, then moves the
   * elevation along the hop (or eases it to the ground) and ages the
   * landing squash.
   * @param dt Seconds since the last frame.
   * @param t The player's state.
   * @param k How far to ease toward the ground this frame.
   * @param groundHeight Ground height under it.
   * @param elevation The current elevation.
   * @returns The new elevation.
   */
  settle(dt: number, t: PlayerState, k: number, groundHeight: number, elevation: number): number {
    if (this._lastGround !== null && this._lastGround - groundHeight > 0.5 && t.moving && !t.lifted && !this._jump) {
      this._jump = { age: 0, from: elevation, hop: JUMP_HOP };
    }
    this._lastGround = groundHeight;
    this.jumpPose = 0;
    if (this._jump) {
      this._jump.age += dt;
      const s = Math.min(1, this._jump.age / JUMP_TIME);
      elevation = this._jump.from + (groundHeight - this._jump.from) * s * s + Math.sin(s * Math.PI) * this._jump.hop;
      this.jumpPose = Math.sin(Math.min(1, s * 1.4) * Math.PI / 2) * (1 - s * s);
      if (s >= 1) {
        this._jump = null;
        this._landAge = 0;
      }
    } else {
      elevation += (groundHeight - elevation) * k;
    }
    this._landAge = Math.min(LAND_TIME, this._landAge + dt);
    this.squash = Math.sin((this._landAge / LAND_TIME) * Math.PI) * (this._landAge < LAND_TIME ? 1 : 0);
    return elevation;
  }

  /**
   * Measures the run, steps the legs, tips the hips, and adds the hop's
   * tuck, the landing squash, and the slump.
   * @param dt Seconds since the last frame.
   * @param t The player's state.
   * @param dx How far it moved along x this frame.
   * @param dy How far it moved along y this frame.
   * @param facing Its smoothed facing.
   * @param rig The figure.
   * @param group The avatar's group (squashed on landing).
   */
  pose(dt: number, t: PlayerState, dx: number, dy: number, facing: number, rig: PlayerRig, group: Group): void {
    const v = 1 - Math.exp(-RUN_SMOOTHING * dt);
    this._velocity.x += (dx / Math.max(dt, 1e-3) - this._velocity.x) * v;
    this._velocity.y += (dy / Math.max(dt, 1e-3) - this._velocity.y) * v;
    const cos = Math.cos(facing);
    const sin = Math.sin(facing);
    /**
     * Clamps a value to -1..1.
     * @param n The value.
     * @returns The clamped value.
     */
    const clamp = (n: number): number => Math.max(-1, Math.min(1, n));
    this.run = clamp((this._velocity.x * cos + this._velocity.y * sin) / PLAYER_SPEED);
    this.side = clamp((this._velocity.y * cos - this._velocity.x * sin) / PLAYER_SPEED);
    const speed = Math.min(1, Math.hypot(this.run, this.side));
    this.speed = speed;

    if (t.moving) {
      this.walkPhase += dt * (9 + 7 * speed);
    } else {
      this.walkPhase = 0;
    }
    const stride = Math.sin(this.walkPhase);
    this.stride = stride;
    const lift = Math.cos(this.walkPhase) * 0.06 * speed;
    const { legL, legR, hips, body } = rig;
    legL.position.x = stride * (0.07 + 0.06 * speed);
    legR.position.x = -stride * (0.07 + 0.06 * speed);
    legL.position.y = Math.max(0, lift);
    legR.position.y = Math.max(0, -lift);
    body.position.y = Math.abs(stride) * (0.03 + 0.04 * speed);
    hips.rotation.z = -RUN_LEAN * this.run;
    hips.rotation.x = SIDE_LEAN * this.side;
    hips.rotation.y = stride * 0.12 * speed;
    this._slump = Math.max(0, Math.min(1, this._slump + (t.connected ? -1 : 1) * SLUMP_SPEED * dt));
    const slump = this._slump * this._slump * (3 - 2 * this._slump);
    this.slumpPose = slump;
    const jumpPose = this.jumpPose;
    const squash = this.squash;
    legL.rotation.z = 0.9 * jumpPose;
    legR.rotation.z = -0.5 * jumpPose;
    legL.position.y += 0.1 * jumpPose;
    legR.position.y += 0.1 * jumpPose;
    hips.rotation.z -= 0.35 * jumpPose;
    body.position.y -= 0.08 * squash + 0.16 * slump;
    legL.rotation.z += 1.35 * slump;
    legR.rotation.z += 1.2 * slump;
    legL.position.y += 0.12 * slump;
    legR.position.y += 0.12 * slump;
    hips.rotation.z -= 0.45 * slump;
    group.scale.set(1 + 0.12 * squash, 1 - 0.18 * squash, 1 + 0.12 * squash);
  }

  /**
   * Launches a charged gauntlet's super uppercut hop, unless already in
   * the air.
   * @param elevation The current elevation.
   */
  superHop(elevation: number): void {
    if (!this._jump) {
      this._jump = { age: 0, from: elevation, hop: SUPER_HOP };
    }
  }
}
