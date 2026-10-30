// Packages
import {
  BoxGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
} from 'three';
import { RAMP_DIRS } from '@halloween/shared/world/ramps';
import { WorldMap } from '@halloween/shared/world/world-map';

// Local Imports
import { NO_BLOOM_LAYER } from '../../effects/post/config/post';
import { toWorld } from '../../space/world-coords';
import { ScenePart } from '../scene-part';
import { EDIT_CURSOR } from './config/editor';

/**
 * The map editor's stairs preview: a see-through flight of four steps on
 * the pointed-at tile, rebuilt only when what it shows changes.
 */
export class StairsGhost extends ScenePart {
  /**
   * The shown flight and what it was built for, or null before the first.
   */
  private _stairsGhost: { key: string; group: Group } | null = null;

  /**
   * Shows the stairs the map editor would place on a tile, climbing `dir`
   * if they can, else whichever way the game would pick, or hides them
   * (null).
   * @param g The tile and the way to climb, or null.
   * @returns Which way the shown stairs climb (an index into RAMP_DIRS),
   *   or null when nothing there is higher.
   */
  show(g: { tx: number; ty: number; dir: number | null } | null): number | null {
    if (!g || !this.map) {
      if (this._stairsGhost) {
        this._stairsGhost.group.visible = false;
      }
      return null;
    }
    const map = WorldMap.decode(this.map.encode(), this.map.encodeLevels(), this.map.encodeRamps(), this.map.width)!;
    map.set(g.tx, g.ty, 'stairs');
    map.setRamp(g.tx, g.ty, g.dir);
    const up = map.rampUp(g.tx, g.ty);
    const shown = up ? RAMP_DIRS.findIndex(([dx, dy]): boolean => dx === up[0] && dy === up[1]) : null;
    const key = `${g.tx},${g.ty},${shown},${this.map.encodeLevels()}`;
    if (this._stairsGhost?.key !== key) {
      if (this._stairsGhost) {
        this.scene.remove(this._stairsGhost.group);
        this._stairsGhost.group.children.forEach((o) => (o as Mesh).geometry.dispose());
        ((this._stairsGhost.group.children[0] as Mesh).material as MeshBasicMaterial).dispose();
      }
      const material = new MeshBasicMaterial({ color: EDIT_CURSOR, depthTest: false, transparent: true, opacity: 0.6 });
      const group = new Group();
      const [dx, dz] = up ?? [0, -1];
      const base = map.base(g.tx, g.ty);
      const rise = Math.max(0.2, map.top(g.tx, g.ty) - base);
      for (let i = 0; i < 4; i++) {
        const offset = -0.375 + i * 0.25;
        const h = (i + 1) * (rise / 4);
        const step = new Mesh(new BoxGeometry(dx !== 0 ? 0.22 : 0.9, h, dx !== 0 ? 0.9 : 0.22), material);
        step.position.set(dx * offset, base + h / 2, dz * offset);
        step.renderOrder = 9;
        step.layers.set(NO_BLOOM_LAYER);
        group.add(step);
      }
      const { x, z } = toWorld(g.tx + 0.5, g.ty + 0.5);
      group.position.set(x, 0, z);
      this.scene.add(group);
      this._stairsGhost = { key, group };
    }
    this._stairsGhost.group.visible = true;
    return shown;
  }
}
