// Packages
import { Group } from 'three';

// Local Imports
import { toWorld } from '../space/world-coords';
import { HURT_FLASH_TIME } from './config/avatar';

// Types
import type { VoxelParts } from './shared/voxel-parts';

/**
 * What every avatar's server state has: where it is, which way it faces,
 * and how many times it has been hurt.
 */
export interface AvatarState {
  /**
   * Tile-space x.
   */
  x: number;

  /**
   * Tile-space y.
   */
  y: number;

  /**
   * Facing, in radians.
   */
  facing: number;

  /**
   * Hits taken so far (a change flashes the body).
   */
  hurts: number;
}

/**
 * A voxel character built from boxes, facing +x in its local space, that
 * smooths toward the latest server state each frame. Subclasses build the
 * body and animate it.
 */
export abstract class Avatar<TState extends AvatarState> {
  /**
   * The whole character, placed in the world each frame.
   */
  readonly group = new Group();

  /**
   * The body (everything above the legs).
   */
  readonly body = new Group();

  /**
   * World-space streak behind a swing; the renderer adds it to the scene.
   */
  readonly trail = new Group();

  /**
   * The head.
   */
  protected readonly _head = new Group();

  /**
   * The latest server state.
   */
  target: TState;

  /**
   * Stand exactly where `target` says instead of easing toward it (the
   * renderer is already placing it: predicted or interpolated).
   */
  exact = false;

  /**
   * Smoothed tile-space x.
   */
  protected _x: number;

  /**
   * Smoothed tile-space y.
   */
  protected _y: number;

  /**
   * Smoothed facing, in radians.
   */
  protected _facing: number;

  /**
   * Smoothed ground height it stands on.
   */
  protected _elevation = 0;

  /**
   * Hits seen so far.
   */
  protected _hurts: number;

  /**
   * Seconds since the last hit.
   */
  protected _hurtAge = HURT_FLASH_TIME;

  /**
   * Starts an avatar at the state's position.
   * @param state The first server state.
   * @param _parts The boxes it will be built from.
   */
  constructor(state: TState, protected readonly _parts: VoxelParts) {
    this.target = state;
    this._x = state.x;
    this._y = state.y;
    this._facing = state.facing;
    this._hurts = state.hurts;
  }

  /**
   * Advances smoothing and animation.
   * @param dt Seconds since the last frame.
   * @param time Seconds since the renderer started.
   * @param groundHeight Ground height under it (plus any lift).
   */
  abstract update(dt: number, time: number, groundHeight: number): void;

  /**
   * Kicks and flaps while held up by the TV's mouse. Runs after `update`.
   * @param amount 0 (on the ground) to 1 (fully lifted).
   * @param time Seconds since the renderer started.
   */
  abstract flail(amount: number, time: number): void;

  /**
   * Smoothed tile-space position, for its light or glow.
   * @returns The position.
   */
  get position(): { x: number; y: number } {
    return { x: this._x, y: this._y };
  }

  /**
   * Puts the group where the smoothed position, elevation, and facing say.
   */
  protected placeGroup(): void {
    const { x, z } = toWorld(this._x, this._y);
    this.group.position.set(x, this._elevation, z);
    this.group.rotation.y = -this._facing;
  }

  /**
   * Restarts the hurt flash on a new hit and ages it.
   * @param dt Seconds since the last frame.
   * @returns How strong the flash is now, 1 just hit to 0.
   */
  protected advanceHurt(dt: number): number {
    if (this.target.hurts !== this._hurts) {
      this._hurts = this.target.hurts;
      this._hurtAge = 0;
    }
    this._hurtAge = Math.min(this._hurtAge + dt, HURT_FLASH_TIME);
    return 1 - this._hurtAge / HURT_FLASH_TIME;
  }

  /**
   * Disposes the materials of its boxes.
   */
  dispose(): void {
    this._parts.dispose();
  }
}
