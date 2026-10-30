// Packages
import {
  Plane,
  Raycaster,
  Vector2,
  Vector3,
} from 'three';
import { LEVEL_HEIGHT, MAX_LEVEL, MIN_LEVEL } from '@halloween/shared/world/dimensions';

// Local Imports
import { GRAB_RADIUS } from '../actors/config/actors';
import { ScenePart } from '../scene-part';

// Types
import type { Group } from 'three';
import type { LiftTarget } from '@halloween/shared/protocol/tv-tools';
import type { MonsterAvatar } from '../../avatars/monsters/monster-avatar';
import type { PlayerAvatar } from '../../avatars/player/player-avatar';

/**
 * Turns screen points into map points for the TV's mouse and the map
 * editor: the ground under the pointer, the tiles a view ray passes
 * through, and the player or monster close enough to grab.
 */
export class ScreenPicker extends ScenePart {
  /**
   * Casts the view ray.
   */
  private _raycaster = new Raycaster();

  /**
   * The pointer in normalized device coordinates.
   */
  private _pointer = new Vector2();

  /**
   * A level ground plane, raised to each guess's height.
   */
  private _ground = new Plane(new Vector3(0, 1, 0), 0);

  /**
   * Scratch point where the ray meets the plane.
   */
  private _hit = new Vector3();

  /**
   * Scratch point projected to the screen.
   */
  private _projected = new Vector3();

  /**
   * The map point (in tiles) under a screen point, on the ground there.
   * @param clientX Screen x.
   * @param clientY Screen y.
   * @returns The tile-space point.
   */
  groundAt(clientX: number, clientY: number): { x: number; y: number } {
    const rect = this._ctx.renderer.domElement.getBoundingClientRect();
    this._pointer.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    this._raycaster.setFromCamera(this._pointer, this.camera);
    let x = 0;
    let y = 0;
    let height = 0;
    for (let i = 0; i < 3; i++) {
      this._ground.constant = -height;
      if (!this._raycaster.ray.intersectPlane(this._ground, this._hit)) {
        break;
      }
      x = this._hit.x + this._ctx.mapWidth / 2;
      y = this._hit.z + this._ctx.mapHeight / 2;
      height = this._ctx.elevation(x, y);
    }
    return { x, y };
  }

  /**
   * The tiles under a screen point for the map editor, nearest first: every
   * column of ground the view ray runs into as it goes on through the
   * terrain, so tiles hidden behind a raised block can be reached too (the
   * editor steps through them with the scroll wheel). When the ray meets
   * the side of a block, that block counts, unless the tile in front of the
   * wall is sunk below the ground (a pit or a valley seen across its back
   * wall), then that one does. Only tiles on the map.
   * @param clientX Screen x.
   * @param clientY Screen y.
   * @returns The tiles, with the tile-space point the ray met each at.
   */
  pickTiles(clientX: number, clientY: number): { tx: number; ty: number; x: number; y: number }[] {
    const map = this.map;
    const hits: { tx: number; ty: number; x: number; y: number }[] = [];
    if (!map) {
      return hits;
    }
    const rect = this._ctx.renderer.domElement.getBoundingClientRect();
    this._pointer.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    this._raycaster.setFromCamera(this._pointer, this.camera);
    const { origin: o, direction: d } = this._raycaster.ray;
    if (d.y >= 0) {
      return hits;
    }
    const start = (o.y - (MAX_LEVEL + 1) * LEVEL_HEIGHT) / -d.y;
    const end = (o.y - (MIN_LEVEL - 1) * LEVEL_HEIGHT) / -d.y;
    const step = 0.04 / Math.max(0.2, Math.hypot(d.x, d.z));
    const drop = step * -d.y;
    let prev: { tx: number; ty: number } | null = null;
    let inside = false;
    for (let t = Math.max(0, start); t <= end && hits.length < 6; t += step) {
      const x = o.x + d.x * t + this._ctx.mapWidth / 2;
      const y = o.z + d.z * t + this._ctx.mapHeight / 2;
      const h = o.y + d.y * t;
      const tx = Math.floor(x);
      const ty = Math.floor(y);
      const ground = map.elevationAt(x, y);
      if (h <= ground && !inside) {
        let hit = { tx, ty };
        if (prev && (prev.tx !== tx || prev.ty !== ty) && ground - h > drop * 1.5 && map.level(prev.tx, prev.ty) < 0) {
          hit = prev;
        }
        if (hit.tx >= 0 && hit.ty >= 0 && hit.tx < this._ctx.mapWidth && hit.ty < this._ctx.mapHeight && !hits.some((o2) => o2.tx === hit.tx && o2.ty === hit.ty)) {
          hits.push({ ...hit, x, y });
        }
      }
      inside = h <= ground;
      prev = { tx, ty };
    }
    return hits;
  }

  /**
   * The living player or monster drawn closest to a screen point, if one is
   * close enough to grab.
   * @param clientX Screen x.
   * @param clientY Screen y.
   * @param avatars Every player's avatar.
   * @param monsters Every monster's avatar.
   * @returns What to grab, or null.
   */
  entityAt(clientX: number, clientY: number, avatars: ReadonlyMap<string, PlayerAvatar>, monsters: ReadonlyMap<number, MonsterAvatar>): LiftTarget | null {
    const rect = this._ctx.renderer.domElement.getBoundingClientRect();
    const reach = (GRAB_RADIUS * rect.height) / (this.camera.top - this.camera.bottom);
    let best: LiftTarget | null = null;
    let bestD = reach;
    /**
     * Keeps a target if its screen position is the nearest to the pointer so far.
     * @param group The target's model.
     * @param target The target.
     */
    const check = (group: Group, target: LiftTarget): void => {
      this._projected.set(group.position.x, group.position.y + 0.45, group.position.z).project(this.camera);
      const d = Math.hypot(rect.left + ((this._projected.x + 1) / 2) * rect.width - clientX, rect.top + ((1 - this._projected.y) / 2) * rect.height - clientY);
      if (d < bestD) {
        best = target;
        bestD = d;
      }
    };
    for (const avatar of avatars.values()) {
      if (avatar.target.connected && !avatar.target.dead) {
        check(avatar.group, { kind: 'player', id: avatar.target.id });
      }
    }
    for (const monster of monsters.values()) {
      check(monster.group, { kind: 'monster', id: monster.target.id });
    }
    return best;
  }
}
