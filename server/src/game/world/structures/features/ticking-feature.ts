// Local Imports
import { WorldFeature } from '../../world-feature';

// Types
import type { StructureState } from '../../types/structures';

/**
 * A kind of structure that does something every step, called by the
 * structure ticker for each structure of its kind.
 */
export abstract class TickingFeature extends WorldFeature {
  /**
   * Advances one structure by a step.
   * @param tx The structure's tile column.
   * @param ty The structure's tile row.
   * @param s The structure's state.
   * @param dt Seconds since the last step.
   */
  abstract tick(tx: number, ty: number, s: StructureState, dt: number): void;
}
