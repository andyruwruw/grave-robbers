// Packages
import { Group } from 'three';

// Local Imports
import { buildGearModel } from '../../models/gear/gear-model';
import { MonsterAvatar } from './monster-avatar';

// Types
import type { GearKind } from '@halloween/shared/gear/types/gear-def';

/**
 * A monster that can carry a piece of junk in its fist and wear a helmet
 * or plate (zombies and brutes).
 */
export abstract class ArmedMonsterAvatar extends MonsterAvatar {
  /**
   * Puts the junk it carries in a hand.
   * @param arm The arm holding it.
   * @param x How far along the arm the hand is.
   * @param held What it carries.
   */
  protected mountHeld(arm: Group, x: number, held: GearKind): void {
    const weapon = new Group();
    weapon.add(...buildGearModel(held, this._parts.box).parts);
    weapon.position.set(x, 0, 0);
    weapon.rotation.z = Math.PI / 2 - 0.6;
    weapon.scale.setScalar(0.85);
    arm.add(weapon);
  }
}
