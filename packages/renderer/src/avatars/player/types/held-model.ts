// Types
import type { Group, Vector3 } from 'three';
import type { GearModel } from '../../../types/models';

/**
 * One model a player can hold, built once and shown when it's in hand.
 */
export interface HeldModel {
  /**
   * Holds the model's parts; hidden while something else is in hand.
   */
  group: Group;

  /**
   * The model itself (its edge, flame, drum, whip joints, and motion).
   */
  model: GearModel;

  /**
   * The flame's own size, for flickering about it, or null.
   */
  flameBase: Vector3 | null;
}
