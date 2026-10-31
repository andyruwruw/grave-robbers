// Packages
import {
  BoxGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
} from 'three';

// Local Imports
import { toWorld } from '../space/world-coords';

// Types
import type { FlameSpot } from '../types/effects';

/**
 * The unit box every flame layer is scaled from.
 */
const UNIT_BOX = new BoxGeometry(1, 1, 1);

/**
 * Most flames drawn at once: 96 for torches and fires, plus room for
 * burning monsters and ground (`BURN_FLAME.budget`, `PATCH_FLAMES.budget`).
 */
const POOL_SIZE = 136;

/**
 * Animated voxel flames for burning torches and campfires (and crimson
 * ones for blood), burning monsters, and burning ground. A fixed pool of
 * three-box flames is repositioned every frame; unused ones are hidden.
 */
export class Flames {
  /**
   * Every flame mesh.
   */
  readonly group = new Group();

  /**
   * Orange layers, outside in.
   */
  private _materials = [
    new MeshBasicMaterial({ color: '#d9461e' }),
    new MeshBasicMaterial({ color: '#ff9a2e' }),
    new MeshBasicMaterial({ color: '#ffe08a' }),
  ];

  /**
   * Crimson layers, outside in.
   */
  private _bloodMaterials = [
    new MeshBasicMaterial({ color: '#7a0a14' }),
    new MeshBasicMaterial({ color: '#d0142a' }),
    new MeshBasicMaterial({ color: '#ff6a6a' }),
  ];

  /**
   * Ghostly blue-green layers, outside in.
   */
  private _soulMaterials = [
    new MeshBasicMaterial({ color: '#1a5a7a' }),
    new MeshBasicMaterial({ color: '#3fc0e8' }),
    new MeshBasicMaterial({ color: '#c8f8ff' }),
  ];

  /**
   * The pool: three layer meshes per flame.
   */
  private _pool: Mesh[][] = [];

  /**
   * Fills the pool with hidden flames.
   */
  constructor() {
    for (let i = 0; i < POOL_SIZE; i++) {
      const parts = this._materials.map((m: MeshBasicMaterial): Mesh => {
        const mesh = new Mesh(UNIT_BOX, m);
        mesh.visible = false;
        this.group.add(mesh);
        return mesh;
      });
      this._pool.push(parts);
    }
  }

  /**
   * Places a flame on each spot this frame and hides the rest.
   * @param spots Every burning flame.
   * @param time Seconds since the renderer started.
   */
  update(spots: FlameSpot[], time: number): void {
    this._pool.forEach((parts: Mesh[], i: number): void => {
      const spot = spots[i];
      parts.forEach((mesh: Mesh, layer: number): void => {
        mesh.visible = spot !== undefined;
        if (!spot) {
          return;
        }
        mesh.material = (spot.blood ? this._bloodMaterials : spot.soul ? this._soulMaterials : this._materials)[layer];
        const { x, z } = toWorld(spot.x, spot.y);
        const flicker = 0.8 + 0.2 * Math.sin(time * (11 + layer * 3) + i * 1.7) * Math.sin(time * 5.3 + i);
        const s = spot.size * (0.5 + 0.5 * spot.strength);
        const w = s * (0.36 - layer * 0.1);
        const h = s * (0.5 - layer * 0.1) * flicker;
        mesh.scale.set(w, h, w);
        mesh.position.set(x + Math.sin(time * 7 + i + layer) * 0.02 * s, spot.height + h / 2 + layer * 0.02, z);
        mesh.rotation.y = time * (layer % 2 ? -1 : 1) + i;
      });
    });
  }

  /**
   * Frees the orange, crimson, and soul-fire materials.
   */
  dispose(): void {
    [...this._materials, ...this._bloodMaterials, ...this._soulMaterials].forEach((m: MeshBasicMaterial): void => m.dispose());
  }
}
