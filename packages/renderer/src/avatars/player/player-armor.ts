// Packages
import { Group } from 'three';
import { GEAR, GEAR_KINDS } from '@halloween/shared/gear/gear-catalog';

// Local Imports
import { buildGearModel } from '../../models/gear/gear-model';

// Types
import type { GearKind } from '@halloween/shared/gear/types/gear-def';
import type { BoxFactory } from '../../types/models';

/**
 * Every armor a player can wear, built once and shown as it's equipped.
 */
export class PlayerArmor {
  /**
   * Holds every armor model; goes on the body.
   */
  readonly plate = new Group();

  /**
   * Each armor's model.
   */
  private _armors = new Map<GearKind, Group>();

  /**
   * Builds every armor model.
   * @param box Makes the avatar's boxes.
   */
  build(box: BoxFactory): void {
    for (const kind of GEAR_KINDS.filter((k: GearKind): boolean => GEAR[k].slot === 'armor')) {
      const group = new Group();
      group.add(...buildGearModel(kind, box).parts);
      this._armors.set(kind, group);
      this.plate.add(group);
    }
  }

  /**
   * Shows the equipped armor (or none).
   * @param armor What's equipped.
   */
  show(armor: GearKind | null): void {
    for (const [kind, group] of this._armors) {
      group.visible = kind === armor;
    }
  }
}
