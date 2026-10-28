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
import { toWorld } from './build-graveyard';
import { materialModel, resourceModel } from './item-models';
import { LABEL_HEIGHT } from './player-avatar';

// Types
import type { Goods, Material, Resource } from '@halloween/shared/items';
import type { BoxFactory } from './gear-models';

const UNIT_BOX = new BoxGeometry(1, 1, 1);
const LIFE = 0.8;
const RISE = 0.6;

/**
 * Popups start above the picker's name label (its anchor plus the label's
 * own height), so they never cover it.
 */
const START_HEIGHT = LABEL_HEIGHT + 1.1;
const SPIN = 10;

/**
 * Widest a popup gets, in tiles.
 */
const SIZE = 0.5;

/**
 * One pickup rising over where it was picked up.
 */
interface Popup {
  group: Group;
  size: number;
  base: number;
  age: number;
}

/**
 * Little models of what a player just picked up (candy, blood, wood,
 * stone, and the rest, the same models as the phone's icons) that pop up
 * over them, spin as they rise, then shrink away. They glow on their own
 * so they read in the dark.
 */
export class PickupPopups {
  readonly group = new Group();
  private materials = new Map<string, MeshBasicMaterial>();
  private popups: Popup[] = [];

  private box: BoxFactory = (size, pos, color) => {
    let material = this.materials.get(color);
    if (!material) {
      material = new MeshBasicMaterial({ color });
      this.materials.set(color, material);
    }
    const mesh = new Mesh(UNIT_BOX, material);
    mesh.scale.set(...size);
    mesh.position.set(...pos);
    return mesh;
  };

  /**
   * Pops one up over tile-space (x, y), standing on ground `height`.
   */
  spawn(goods: Goods, x: number, y: number, height: number): void {
    const model = new Group();
    model.add(...(goods === 'candy' || goods === 'blood' ? resourceModel(goods as Resource, this.box) : materialModel(goods as Material, this.box)));
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
    this.popups.push({ group, size: SIZE / Math.max(extent.x, extent.y, extent.z), base: height + START_HEIGHT, age: 0 });
  }

  update(dt: number): void {
    for (let i = this.popups.length - 1; i >= 0; i--) {
      const p = this.popups[i];
      p.age += dt;
      const k = p.age / LIFE;
      if (k >= 1) {
        this.group.remove(p.group);
        this.popups.splice(i, 1);
        continue;
      }
      const pop = k < 0.15 ? (k / 0.15) * 1.3 : k < 0.25 ? 1.3 - ((k - 0.15) / 0.1) * 0.3 : k > 0.8 ? 1 - (k - 0.8) / 0.2 : 1;
      p.group.scale.setScalar(pop * p.size);
      p.group.position.y = p.base + RISE * (1 - (1 - k) * (1 - k));
      p.group.rotation.y = p.age * SPIN;
    }
  }

  dispose(): void {
    this.materials.forEach((m: MeshBasicMaterial): void => m.dispose());
  }
}
