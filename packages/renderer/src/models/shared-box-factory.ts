// Packages
import {
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
} from 'three';

// Types
import type { BoxFactory } from '../types/models';

/**
 * The unit box every box is scaled from.
 */
const UNIT_BOX = new BoxGeometry(1, 1, 1);

/**
 * Makes boxes for gear and item models that share one material per color
 * (lit, or glowing when asked), so every model reuses the same few.
 */
export class SharedBoxFactory {
  /**
   * Shared materials by color and glow.
   */
  private _materials = new Map<string, MeshLambertMaterial | MeshBasicMaterial>();

  /**
   * Starts with no materials.
   * @param _castShadow Whether boxes cast shadows (ground piles do, icons don't).
   */
  constructor(private _castShadow: boolean) {}

  /**
   * A box, sharing one material per color.
   * @param size Its size.
   * @param pos Its position.
   * @param color Its color.
   * @param glow Whether it glows (unlit).
   * @returns The box.
   */
  readonly box: BoxFactory = (size, pos, color, glow = false): Mesh => {
    const key = `${color}:${glow}`;
    let material = this._materials.get(key);
    if (!material) {
      material = glow ? new MeshBasicMaterial({ color }) : new MeshLambertMaterial({ color });
      this._materials.set(key, material);
    }
    const mesh = new Mesh(UNIT_BOX, material);
    mesh.scale.set(...size);
    mesh.position.set(...pos);
    if (this._castShadow) {
      mesh.castShadow = true;
    }
    return mesh;
  };

  /**
   * Frees every shared material.
   */
  dispose(): void {
    this._materials.forEach((m): void => m.dispose());
  }
}
