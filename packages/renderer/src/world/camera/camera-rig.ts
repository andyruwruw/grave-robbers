// Packages
import { Vector3 } from 'three';

// Local Imports
import { toWorld } from '../../space/world-coords';
import { ScenePart } from '../scene-part';
import { CameraFollow } from './camera-follow';
import {
  CAMERA_DISTANCE,
  CAMERA_ELEVATION,
  CAMERA_TILT_RATE,
  FOLLOW_EDGE,
  SHAKE_AMOUNT,
  SHAKE_TIME,
  TOP_VIEW_ELEVATION,
  VIEW_MARGIN,
} from './config/camera';

// Types
import type { MapView } from '@halloween/shared/protocol/tv-tools';
import type { FollowView } from '../../types/camera';
import type { Scenery } from '../chunks/scenery';
import type { WorldContext } from '../world-context';

/**
 * Places the camera: its tilt (eased toward the map editor's top-down
 * view), what it frames (the whole map, a preset's view, or a followed
 * player), and the screen shake when hits connect.
 */
export class CameraRig extends ScenePart {
  /**
   * The followed player and where the camera has eased to.
   */
  readonly follow: CameraFollow;

  /**
   * Where the camera sits before any shake.
   */
  readonly home = new Vector3();

  /**
   * The part of the map the camera frames (the sandbox's arena), or null
   * for the whole map.
   */
  view: MapView | null = null;

  /**
   * The camera's elevation above the horizon, in radians.
   */
  cameraAngle = CAMERA_ELEVATION;

  /**
   * Whether the camera tilts over to the map editor's top-down view.
   */
  topView = false;

  /**
   * Seconds of screen shake left.
   */
  shake = 0;

  /**
   * Starts framing the whole map from the usual tilt.
   * @param ctx What every part of the scene shares.
   * @param _scenery The outskirts, built wider when the view shows more.
   */
  constructor(ctx: WorldContext, private _scenery: Scenery) {
    super(ctx);
    this.follow = new CameraFollow(ctx);
  }

  /**
   * Points the camera at the middle of the map from its current tilt.
   */
  aim(): void {
    const v = this.view;
    const { x, z } = v ? toWorld(v.x + v.w / 2, v.y + v.h / 2) : { x: 0, z: 0 };
    this.camera.position.set(x, Math.sin(this.cameraAngle) * CAMERA_DISTANCE, z + Math.cos(this.cameraAngle) * CAMERA_DISTANCE);
    this.camera.lookAt(x, 0, z);
    this.home.copy(this.camera.position);
  }

  /**
   * Eases the camera's tilt toward the editor's top-down view or back.
   * @param dt Seconds since the last frame.
   */
  tilt(dt: number): void {
    const target = this.topView ? TOP_VIEW_ELEVATION : CAMERA_ELEVATION;
    if (this.cameraAngle === target) {
      return;
    }
    const step = CAMERA_TILT_RATE * dt;
    this.cameraAngle = Math.abs(target - this.cameraAngle) <= step ? target : this.cameraAngle + Math.sign(target - this.cameraAngle) * step;
    this.aim();
    this.fit();
  }

  /**
   * Follows one player up close, or a tile point, or (null and no point)
   * frames the whole map again.
   * @param id The player followed, or null.
   * @param view How much ground shows.
   * @param at A tile point to look at while there's no player.
   */
  setFollow(id: string | null, view: FollowView, at: { x: number; y: number } | null): void {
    this.follow.target = id || at ? { id: id ?? '', view, at } : null;
    if (!this.follow.target) {
      this.follow.at = null;
      this.aim();
    }
    this.fit();
  }

  /**
   * Frames the whole map (or just its `view`, the sandbox's arena) for the
   * container's shape and the camera's tilt, building more scenery beyond
   * the fence if the view now shows more.
   */
  fit(): void {
    const w = this._ctx.container.clientWidth;
    const h = this._ctx.container.clientHeight;
    if (w === 0 || h === 0) {
      return;
    }
    const aspect = w / h;
    /**
     * The half-height that fits a span of tiles in view.
     * @param spanW Tiles across.
     * @param spanH Tiles deep.
     * @returns The half-height.
     */
    const fit = (spanW: number, spanH: number): number => Math.max((spanH * Math.sin(this.cameraAngle) + VIEW_MARGIN * Math.cos(this.cameraAngle) + 1) / 2, (spanW + 1) / 2 / aspect);
    const followed = this.follow.target?.view;
    const halfH = followed === undefined
      ? fit(this.view?.w ?? this._ctx.mapWidth, this.view?.h ?? this._ctx.mapHeight)
      : typeof followed === 'number' ? (followed * Math.sin(this.cameraAngle)) / 2 : fit(followed.w, followed.h);
    this.camera.left = -halfH * aspect;
    this.camera.right = halfH * aspect;
    this.camera.top = halfH;
    this.camera.bottom = -halfH;
    this.camera.updateProjectionMatrix();
    this._scenery.fitSpan(this.follow.target ? {
      x: FOLLOW_EDGE + 1 + Math.max(0, Math.ceil(halfH * aspect - this._ctx.mapWidth / 2)),
      y: FOLLOW_EDGE + 3 + Math.max(0, Math.ceil(halfH / Math.sin(this.cameraAngle) - this._ctx.mapHeight / 2)),
    } : {
      x: Math.max(0, Math.ceil(halfH * aspect - this._ctx.mapWidth / 2)) + 1,
      y: Math.max(0, Math.ceil(halfH / Math.sin(this.cameraAngle) - this._ctx.mapHeight / 2)) + 3,
    });
  }

  /**
   * Lets the shake die down and puts the camera at home, jolted by what's
   * left of it.
   * @param dt Seconds since the last frame.
   */
  applyShake(dt: number): void {
    this.shake = Math.max(0, this.shake - dt);
    const jolt = (this.shake / SHAKE_TIME) * SHAKE_AMOUNT;
    this.camera.position.set(this.home.x + (Math.random() - 0.5) * 2 * jolt, this.home.y, this.home.z + (Math.random() - 0.5) * 2 * jolt);
  }
}
