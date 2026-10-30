// Packages
import {
  Box3,
  BoxGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  Vector3,
} from 'three';

// Local Imports
import { LABEL_HEIGHT } from '../avatars/player/config/player-look';
import { materialModel } from '../models/items/material-models';
import { resourceModel } from '../models/items/resource-models';
import { toWorld } from '../space/world-coords';
import { EffectLayer } from './effect-layer';

// Types
import type { Goods, Material, Resource } from '@halloween/shared/goods/goods';
import type { BoxFactory } from '../types/models';

/**
 * The unit box every popup box is scaled from.
 */
const UNIT_BOX = new BoxGeometry(1, 1, 1);

/**
 * Seconds a popup lasts.
 */
const LIFE = 0.8;

/**
 * How far a popup rises, in world units.
 */
const RISE = 0.6;

/**
 * Popups start above the picker's name label (its anchor plus the label's
 * own height), so they never cover it.
 */
const START_HEIGHT = LABEL_HEIGHT + 1.1;

/**
 * How fast a popup spins, in radians per second.
 */
const SPIN = 10;

/**
 * Widest a popup gets, in tiles.
 */
const SIZE = 0.5;

/**
 * One pickup rising over where it was picked up.
 */
interface Popup {
  /**
   * The popup's model, centered.
   */
  group: Group;

  /**
   * Its scale at full size.
   */
  size: number;

  /**
   * Height it starts rising from.
   */
  base: number;

  /**
   * Seconds since it popped up.
   */
  age: number;
}

/**
 * Little models of what a player just picked up (candy, blood, wood,
 * stone, and the rest, the same models as the phone's icons) that pop up
 * over them, spin as they rise, then shrink away. They glow on their own
 * so they read in the dark.
 */
export class PickupPopups extends EffectLayer {
  /**
   * Shared glowing materials by color.
   */
  private _materials = new Map<string, MeshBasicMaterial>();

  /**
   * Popups still rising.
   */
  private _popups: Popup[] = [];

  /**
   * A glowing box for a popup model, sharing one material per color.
   * @param size Its size.
   * @param pos Its position.
   * @param color Its color.
   * @returns The box.
   */
  private _box: BoxFactory = (size, pos, color) => {
    let material = this._materials.get(color);
    if (!material) {
      material = new MeshBasicMaterial({ color });
      this._materials.set(color, material);
    }
    const mesh = new Mesh(UNIT_BOX, material);
    mesh.scale.set(...size);
    mesh.position.set(...pos);
    return mesh;
  };

  /**
   * Pops one up over tile-space (x, y), standing on ground `height`.
   * @param goods What was picked up.
   * @param x Tile-space x.
   * @param y Tile-space y.
   * @param height Ground height there.
   */
  spawn(goods: Goods, x: number, y: number, height: number): void {
    const model = new Group();
    model.add(...(goods === 'candy' || goods === 'blood' ? resourceModel(goods as Resource, this._box, goods !== 'blood') : materialModel(goods as Material, this._box)));
    const bounds = new Box3().setFromObject(model);
    const center = bounds.getCenter(new Vector3());
    const extent = bounds.getSize(new Vector3());
    model.position.sub(center);
    const group = new Group();
    group.add(model);
    const { x: wx, z: wz } = toWorld(x, y);
    group.position.set(wx, height + START_HEIGHT, wz);
    group.scale.setScalar(0);
    this.group.add(group);
    this._popups.push({ group, size: SIZE / Math.max(extent.x, extent.y, extent.z), base: height + START_HEIGHT, age: 0 });
  }

  /**
   * Grows, spins, rises and shrinks every popup, and drops finished ones.
   * @param dt Seconds since the last frame.
   */
  update(dt: number): void {
    for (let i = this._popups.length - 1; i >= 0; i--) {
      const p = this._popups[i];
      p.age += dt;
      const k = p.age / LIFE;
      if (k >= 1) {
        this.group.remove(p.group);
        this._popups.splice(i, 1);
        continue;
      }
      const pop = k < 0.15 ? (k / 0.15) * 1.3 : k < 0.25 ? 1.3 - ((k - 0.15) / 0.1) * 0.3 : k > 0.8 ? 1 - (k - 0.8) / 0.2 : 1;
      p.group.scale.setScalar(pop * p.size);
      p.group.position.y = p.base + RISE * (1 - (1 - k) * (1 - k));
      p.group.rotation.y = p.age * SPIN;
    }
  }

  /**
   * Frees the popup materials.
   */
  dispose(): void {
    this._materials.forEach((m: MeshBasicMaterial): void => m.dispose());
  }
}
