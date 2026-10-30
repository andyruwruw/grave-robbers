// Packages
import {
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  RingGeometry,
} from 'three';
import { brushRadius } from '@halloween/shared/map-editor/brush';

// Local Imports
import { NO_BLOOM_LAYER } from '../../effects/post/config/post';
import { toWorld } from '../../space/world-coords';
import { ScenePart } from '../scene-part';
import { EDIT_CURSOR } from './config/editor';

/**
 * The map editor's brush outline: a ring over the tiles the round brush
 * covers, drawn over everything. Made the first time it's shown.
 */
export class EditCursor extends ScenePart {
  /**
   * The ring, or null before it's first shown.
   */
  private _editCursor: Mesh | null = null;

  /**
   * Rings the tiles the map editor's round brush covers (`size` tiles
   * across, around a tile), drawn over everything, or hides it (null).
   * @param c The brush's tile and size, or null.
   */
  set(c: { tx: number; ty: number; size: number } | null): void {
    if (!c || !this.map) {
      if (this._editCursor) {
        this._editCursor.visible = false;
      }
      return;
    }
    if (!this._editCursor) {
      this._editCursor = new Mesh(new RingGeometry(0.86, 1, 48), new MeshBasicMaterial({ color: EDIT_CURSOR, depthTest: false, transparent: true, opacity: 0.9, side: DoubleSide }));
      this._editCursor.rotation.x = -Math.PI / 2;
      this._editCursor.renderOrder = 10;
      this._editCursor.layers.set(NO_BLOOM_LAYER);
      this.scene.add(this._editCursor);
    }
    const { x, z } = toWorld(c.tx + 0.5, c.ty + 0.5);
    const radius = brushRadius(c.size) + 0.2;
    this._editCursor.position.set(x, this.map.base(c.tx, c.ty) + 0.05, z);
    this._editCursor.scale.set(radius, radius, 1);
    this._editCursor.visible = true;
  }
}
