// Types
import type { Object3D } from 'three';

/**
 * Where a monster's swoosh comes from and how it looks.
 */
export interface TrailStyle {
  /**
   * Each point that leaves a streak: its parent and its position in the
   * parent's space (both fists, both claws, the jaws).
   */
  points: [Object3D, [number, number, number]][];

  /**
   * The streak's color.
   */
  color: string;

  /**
   * A fresh bit's opacity.
   */
  opacity: number;

  /**
   * A fresh bit's size, in world units.
   */
  size: number;
}
