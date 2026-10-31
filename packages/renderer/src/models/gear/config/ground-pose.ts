// Types
import type { GearKind } from '@halloween/shared/gear/types/gear-def';

/**
 * How one model lies on the ground.
 */
interface GroundPose {
  /**
   * Rotation about x, in radians.
   */
  rx: number;

  /**
   * Rotation about z, in radians.
   */
  rz: number;

  /**
   * Offset from the drop's spot.
   */
  offset: [number, number, number];

  /**
   * Scale.
   */
  scale: number;
}

/**
 * Laid on the ground: rotation (x, z), offset, and scale for each model.
 */
export const GROUND_POSE: Record<GearKind, GroundPose> = {
  'hammer': { rx: 0, rz: Math.PI / 2, offset: [-0.3, 0.05, 0], scale: 0.85 },
  'infused-hammer': { rx: 0, rz: Math.PI / 2, offset: [-0.34, 0.08, 0], scale: 0.75 },
  'wood-armor': { rx: 0, rz: 0, offset: [0, -0.28, 0], scale: 0.8 },
  'bone-armor': { rx: 0, rz: 0, offset: [0, -0.28, 0], scale: 0.8 },
  'stone-armor': { rx: 0, rz: 0, offset: [0, -0.3, 0], scale: 0.8 },
  'battle-axe': { rx: 0, rz: Math.PI / 2, offset: [-0.35, 0.05, 0], scale: 0.8 },
  'scythe': { rx: -Math.PI / 2, rz: Math.PI / 2, offset: [-0.3, 0.03, 0.17], scale: 0.7 },
  'spear': { rx: 0, rz: Math.PI / 2, offset: [-0.4, 0.03, 0], scale: 0.75 },
  'stake': { rx: 0, rz: Math.PI / 2, offset: [-0.18, 0.03, 0], scale: 1 },
  'ritual-knife': { rx: 0, rz: Math.PI / 2, offset: [-0.12, 0.03, 0], scale: 1 },
  'crossbow': { rx: 0, rz: Math.PI / 2, offset: [-0.2, 0.05, 0], scale: 0.9 },
  'blood-gun': { rx: 0, rz: Math.PI / 2, offset: [-0.18, 0.05, 0], scale: 0.9 },
  'torch': { rx: 0, rz: Math.PI / 2, offset: [-0.2, 0.04, 0], scale: 1 },
  'shield': { rx: -Math.PI / 2, rz: 0, offset: [0, 0.02, -0.16], scale: 0.9 },
  'plate': { rx: 0, rz: 0, offset: [0, -0.28, 0], scale: 0.8 },
  'stick': { rx: 0, rz: Math.PI / 2, offset: [-0.3, 0.03, 0], scale: 0.8 },
  'femur': { rx: 0, rz: Math.PI / 2, offset: [-0.24, 0.04, 0], scale: 0.9 },
  'shovel': { rx: 0, rz: Math.PI / 2, offset: [-0.35, 0.04, 0], scale: 0.75 },
  'wrench': { rx: 0, rz: Math.PI / 2, offset: [-0.28, 0.04, 0], scale: 0.85 },
  'short-sword': { rx: 0, rz: Math.PI / 2, offset: [-0.24, 0.03, 0], scale: 0.95 },
  'greatsword': { rx: 0, rz: Math.PI / 2, offset: [-0.4, 0.04, 0], scale: 0.7 },
  'flail': { rx: 0, rz: Math.PI / 2, offset: [-0.26, 0.06, 0], scale: 0.85 },
  'morning-star': { rx: 0, rz: Math.PI / 2, offset: [-0.3, 0.07, 0], scale: 0.8 },
  'warhammer': { rx: 0, rz: Math.PI / 2, offset: [-0.32, 0.07, 0], scale: 0.8 },
  'quarterstaff': { rx: 0, rz: Math.PI / 2, offset: [-0.3, 0.03, 0], scale: 0.65 },
  'glaive': { rx: 0, rz: Math.PI / 2, offset: [-0.4, 0.03, 0], scale: 0.7 },
  'spiked-gauntlet': { rx: 0, rz: 0, offset: [0, 0.06, 0], scale: 1.1 },
  'bow': { rx: 0, rz: Math.PI / 2, offset: [-0.12, 0.04, 0], scale: 1 },
  'repeating-crossbow': { rx: 0, rz: Math.PI / 2, offset: [-0.2, 0.06, 0], scale: 0.9 },
  'musket': { rx: 0, rz: Math.PI / 2, offset: [-0.3, 0.05, 0], scale: 0.75 },
};
