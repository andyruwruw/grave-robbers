// Local Imports
import { toWorld } from '../../space/world-coords';
import { ScenePart } from '../scene-part';
import { CAMERA_DISTANCE, FOLLOW_EASE, FOLLOW_EDGE } from './config/camera';

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
   * Eases the camera toward the followed player, kept far enough from the
   * map's edge that little shows beyond the fence.
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
    /**
     * Clamps one axis of the follow point so the view stays near the map, or centers it when the map fits.
     * @param v The wanted point.
     * @param half Half the view on this axis.
     * @param span The map on this axis.
     * @returns The clamped point.
     */
    const clamp = (v: number, half: number, span: number): number => (half * 2 >= span + FOLLOW_EDGE * 2 ? 0 : Math.max(-span / 2 + half - FOLLOW_EDGE, Math.min(span / 2 - half + FOLLOW_EDGE, v)));
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
