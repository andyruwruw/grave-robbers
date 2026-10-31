// Packages
import {
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial,
} from 'three';

// Local Imports
import { UNIT_BOX } from '../config/avatar';

// Types
import type { Color, Material } from 'three';

/**
 * How an avatar's boxes are made.
 */
export interface VoxelPartsOptions {
  /**
   * The layer glowing (unlit) boxes go on, if any (monsters keep their eyes
   * out of the bloom).
   */
  glowLayer?: number;

  /**
   * Whether to keep a copy of each lit box's color (players dim and restore
   * them for the spawn protection pulse).
   */
  keepColors?: boolean;
}

/**
 * The boxes one avatar is built from, and every material they use, so the
 * avatar can flash, fade, and dispose them together.
 */
export class VoxelParts {
  /**
   * Every material made here, in the order the boxes were made.
   */
  readonly materials: Material[] = [];

  /**
   * The lit (non-glowing) materials, for the hurt flash.
   */
  readonly lit: MeshLambertMaterial[] = [];

  /**
   * Each lit material's original color, when `keepColors` is set.
   */
  readonly litColors: Color[] = [];

  /**
   * The glowing eyes' materials, which world events can tint.
   */
  readonly eyes: MeshBasicMaterial[] = [];

  /**
   * Each eye material's own color.
   */
  readonly eyeColors: Color[] = [];

  /**
   * How far the eyes are tinted right now.
   */
  private _eyeTint = 0;

  /**
   * Starts an empty set of parts.
   * @param _options How the boxes are made.
   */
  constructor(private readonly _options: VoxelPartsOptions = {}) {}

  /**
   * Makes one box with its own material: lit, or glowing (unlit, casting no
   * shadow). An arrow property so it can be handed to the gear builders.
   * @param size Width, height, and depth.
   * @param pos Position in its parent's space.
   * @param color The color.
   * @param glow Whether it glows instead of being lit.
   * @param opacity How opaque it is (below 1 it's see-through, kept in
   * `userData.opacity` so fades scale it rather than replace it).
   * @returns The box.
   */
  readonly box = (size: [number, number, number], pos: [number, number, number], color: string, glow = false, opacity = 1): Mesh => {
    const see = opacity < 1 ? { transparent: true, opacity, depthWrite: false } : {};
    const material = glow ? new MeshBasicMaterial({ color, ...see }) : new MeshLambertMaterial({ color, ...see });
    if (opacity < 1) {
      material.userData.opacity = opacity;
    }
    this.materials.push(material);
    if (material instanceof MeshLambertMaterial) {
      this.lit.push(material);
      if (this._options.keepColors) {
        this.litColors.push(material.color.clone());
      }
    }
    const mesh = new Mesh(UNIT_BOX, material);
    mesh.scale.set(...size);
    mesh.position.set(...pos);
    mesh.castShadow = !glow && opacity === 1;
    if (glow && this._options.glowLayer !== undefined) {
      mesh.layers.set(this._options.glowLayer);
    }
    return mesh;
  };

  /**
   * Makes one glowing eye: a glowing box whose color a blood moon can
   * shift. An arrow property like `box`.
   * @param size Width, height, and depth.
   * @param pos Position in its parent's space.
   * @param color The color.
   * @returns The box.
   */
  readonly eye = (size: [number, number, number], pos: [number, number, number], color: string): Mesh => {
    const mesh = this.box(size, pos, color, true);
    const material = mesh.material as MeshBasicMaterial;
    this.eyes.push(material);
    this.eyeColors.push(material.color.clone());
    return mesh;
  };

  /**
   * Tints every eye from its own color toward `to`.
   * @param to The color at full tint (null: their own).
   * @param amount How far, 0..1.
   */
  tintEyes(to: Color | null, amount: number): void {
    if (amount === this._eyeTint) {
      return;
    }
    this._eyeTint = amount;
    this.eyes.forEach((m: MeshBasicMaterial, i: number): void => {
      m.color.copy(this.eyeColors[i]);
      if (to) {
        m.color.lerp(to, amount);
      }
    });
  }

  /**
   * A head (or other blocky part) with its edges trimmed: three overlapping
   * boxes, wide, deep, and tall, so the silhouette reads rounded in pixels.
   * @param size Width, height, and depth.
   * @param pos Position in its parent's space.
   * @param color The color.
   * @returns The three boxes.
   */
  roundedBox([w, h, d]: [number, number, number], pos: [number, number, number], color: string): Mesh[] {
    return [
      this.box([w, h * 0.7, d * 0.78], pos, color),
      this.box([w * 0.78, h * 0.7, d], pos, color),
      this.box([w * 0.84, h, d * 0.84], pos, color),
    ];
  }

  /**
   * Disposes every material made here.
   */
  dispose(): void {
    this.materials.forEach((m: Material): void => m.dispose());
  }
}
