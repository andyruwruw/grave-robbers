// Packages
import {
  BoxGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
} from 'three';

// Local Imports
import { toWorld } from './build-graveyard';

const UNIT_BOX = new BoxGeometry(1, 1, 1);
const POOL_SIZE = 96;

/**
 * Where a flame sits and how big it is.
 */
export interface FlameSpot {
  x: number;
  y: number;

  /**
   * World height of the flame's base.
   */
  height: number;

  /**
   * Overall size (torch is small, campfire big).
   */
  size: number;

  /**
   * 0..1, shrinks the flame as fuel runs out.
   */
  strength: number;

  /**
   * Burns crimson (an altar or blood forge) instead of orange.
   */
  blood?: boolean;

  /**
   * Burns with a ghost's cold blue-green (soul fires, ghost lamps).
   */
  soul?: boolean;
}

/**
 * Animated voxel flames for burning torches and campfires (and crimson
 * ones for blood). A fixed pool of
 * three-box flames is repositioned every frame; unused ones are hidden.
 */
export class Flames {
  readonly group = new Group();
  private materials = [
    new MeshBasicMaterial({ color: '#d9461e' }),
    new MeshBasicMaterial({ color: '#ff9a2e' }),
    new MeshBasicMaterial({ color: '#ffe08a' }),
  ];
  private bloodMaterials = [
    new MeshBasicMaterial({ color: '#7a0a14' }),
    new MeshBasicMaterial({ color: '#d0142a' }),
    new MeshBasicMaterial({ color: '#ff6a6a' }),
  ];
  private soulMaterials = [
    new MeshBasicMaterial({ color: '#1a5a7a' }),
    new MeshBasicMaterial({ color: '#3fc0e8' }),
    new MeshBasicMaterial({ color: '#c8f8ff' }),
  ];
  private pool: Mesh[][] = [];

  constructor() {
    for (let i = 0; i < POOL_SIZE; i++) {
      const parts = this.materials.map((m: MeshBasicMaterial): Mesh => {
        const mesh = new Mesh(UNIT_BOX, m);
        mesh.visible = false;
        this.group.add(mesh);
        return mesh;
      });
      this.pool.push(parts);
    }
  }

  update(spots: FlameSpot[], time: number): void {
    this.pool.forEach((parts: Mesh[], i: number): void => {
      const spot = spots[i];
      parts.forEach((mesh: Mesh, layer: number): void => {
        mesh.visible = spot !== undefined;
        if (!spot) {
          return;
        }
        mesh.material = (spot.blood ? this.bloodMaterials : spot.soul ? this.soulMaterials : this.materials)[layer];
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

  dispose(): void {
    [...this.materials, ...this.bloodMaterials].forEach((m: MeshBasicMaterial): void => m.dispose());
  }
}
