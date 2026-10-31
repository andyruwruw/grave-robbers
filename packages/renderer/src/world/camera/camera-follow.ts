// Local Imports
import { toWorld } from '../../space/world-coords';
import { ScenePart } from '../scene-part';
import { CAMERA_DISTANCE, FOLLOW_EASE, FOLLOW_EDGE, LEAD_EASE } from './config/camera';

// Types
import type { Vector3 } from 'three';
import type { PlayerAvatar } from '../../avatars/player/player-avatar';
import type { FollowView } from '../../types/camera';

/**
 * A /play view's (or a split-screen pane's) camera: the player it follows
 * and where the camera has eased to.
 */
export class CameraFollow extends ScenePart {
  /**
   * The player followed and how many tiles of ground it shows top to
   * bottom, or a tile point looked at instead, or null to frame the map.
   */
  target: { id: string; view: FollowView; at: { x: number; y: number } | null } | null = null;

  /**
   * Where the camera has eased to (world x and z), or null.
   */
  at: { x: number; z: number } | null = null;

  /**
   * How far ahead of the player the camera looks, as a share of half the
   * ground in view, toward where they face (0: centered; /play sets
   * PLAY_FOLLOW_LEAD).
   */
  leadShare = 0;

  /**
   * How fast the lead swings round to a new facing (LEAD_EASE unless
   * /play's Camera lead speed sets it).
   */
  leadEase = LEAD_EASE;

  /**
   * How far past the map's edge the camera may look, in halves of the
   * ground in view (0: no further than FOLLOW_EDGE; the admin's 1 lets the
   * map's edge reach the middle of the screen).
   */
  overscroll = 0;

  /**
   * The lead's current offset (world x and z), eased toward the facing at
   * `leadEase`.
   */
  private _lead = { x: 0, z: 0 };

  /**
   * Eases the camera toward the followed player (a little ahead of them,
   * by `leadShare`), kept far enough from the map's edge that little shows
   * beyond the fence.
   * @param dt Seconds since the last frame.
   * @param avatars Every player's avatar.
   * @param angle The camera's elevation, in radians.
   * @param home Where the camera sits before any shake (set here).
   * @returns Where the camera now looks, or null when there's nothing to
   *   follow (nothing moved).
   */
  update(dt: number, avatars: ReadonlyMap<string, PlayerAvatar>, angle: number, home: Vector3): { x: number; z: number } | null {
    const avatar = this.target ? avatars.get(this.target.id) : undefined;
    const point = avatar ? { x: avatar.group.position.x, z: avatar.group.position.z } : this.target?.at ? toWorld(this.target.at.x, this.target.at.y) : null;
    if (!point) {
      return null;
    }
    const halfH = this.camera.top;
    const halfW = this.camera.right;
    const reachZ = halfH / Math.sin(angle);
    if (avatar && this.leadShare > 0) {
      const ahead = Math.min(halfW, reachZ) * this.leadShare;
      const k = 1 - Math.exp(-dt * this.leadEase);
      this._lead.x += (Math.cos(avatar.target.facing) * ahead - this._lead.x) * k;
      this._lead.z += (Math.sin(avatar.target.facing) * ahead - this._lead.z) * k;
      point.x += this._lead.x;
      point.z += this._lead.z;
    }
    /**
     * Clamps one axis of the follow point so the view stays near the map, or centers it when the map fits.
     * @param v The wanted point.
     * @param half Half the view on this axis.
     * @param span The map on this axis.
     * @returns The clamped point.
     */
    const clamp = (v: number, half: number, span: number): number => {
      const reach = span / 2 - half + FOLLOW_EDGE + half * this.overscroll;
      return reach <= 0 ? 0 : Math.max(-reach, Math.min(reach, v));
    };
    const x = clamp(point.x, halfW, this._ctx.mapWidth);
    const z = clamp(point.z, reachZ, this._ctx.mapHeight);
    if (!this.at) {
      this.at = { x, z };
    } else {
      const k = 1 - Math.exp(-dt * FOLLOW_EASE);
      this.at.x += (x - this.at.x) * k;
      this.at.z += (z - this.at.z) * k;
    }
    home.set(this.at.x, Math.sin(angle) * CAMERA_DISTANCE, this.at.z + Math.cos(angle) * CAMERA_DISTANCE);
    return this.at;
  }
}
