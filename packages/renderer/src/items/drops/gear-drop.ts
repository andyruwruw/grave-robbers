// Packages
import { Group } from 'three';

// Local Imports
import { GROUND_POSE } from '../../models/gear/config/ground-pose';
import { buildGearModel } from '../../models/gear/gear-model';
import { GLINT_HEIGHT } from '../config/piles';
import { GroundDrop } from './ground-drop';

// Types
import type { GearItem } from '@halloween/shared/inventory/bag-items';
import type { ItemState } from '@halloween/shared/goods/ground-items';

/**
 * One piece of gear lying on the ground, laid flat and turned by its id so
 * a row of drops doesn't line up, with a twinkling glint.
 */
export class GearDrop extends GroundDrop {
  /**
   * Builds the gear lying on the ground.
   * @param item The item on the ground (holding gear).
   * @returns The drop's group.
   */
  build(item: ItemState): Group {
    const { kind, infusion } = item.held as GearItem;
    const pile = this.place(item);
    pile.rotation.y = (item.id * 2.39996) % (Math.PI * 2);
    const model = new Group();
    model.add(...buildGearModel(kind, this._ctx.materials.boxes.box, infusion).parts);
    const pose = GROUND_POSE[kind];
    model.rotation.set(pose.rx, 0, pose.rz);
    model.position.set(...pose.offset);
    model.scale.setScalar(pose.scale);
    pile.add(model);
    const glint = this.addGlint(pile, item, 0.05, GLINT_HEIGHT, 0.05);
    glint.rotation.set(Math.PI / 4, Math.PI / 4, 0);
    return pile;
  }
}
