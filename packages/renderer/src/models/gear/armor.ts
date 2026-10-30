// Local Imports
import {
  ARMOR_BONE,
  ARMOR_STONE,
  ARMOR_WOOD,
  GRIP,
  PLATE,
  PLATE_TRIM,
} from './config/palette';

// Types
import type { Mesh } from 'three';
import type { BoxFactory, GearModel } from '../../types/models';

/**
 * Plate armor on the torso.
 * @param box Makes each box.
 * @returns The model.
 */
export const buildPlate = (box: BoxFactory): GearModel => {
  return {
    parts: [
      box([0.27, 0.22, 0.37], [0, 0.44, 0], PLATE),
      box([0.28, 0.03, 0.38], [0, 0.34, 0], PLATE_TRIM),
      box([0.02, 0.18, 0.06], [0.14, 0.45, 0], PLATE_TRIM),
      box([0.14, 0.07, 0.14], [0, 0.57, -0.2], PLATE_TRIM),
      box([0.14, 0.07, 0.14], [0, 0.57, 0.2], PLATE_TRIM),
    ],
    tip: null,
    flame: null,
  };
};

/**
 * Wood armor: slats and pauldrons on the torso.
 * @param box Makes each box.
 * @returns The model.
 */
export const buildWoodArmor = (box: BoxFactory): GearModel => {
  return {
    parts: [
      ...[0.36, 0.44, 0.52].map((y: number, i: number): Mesh => box([0.27, 0.075, 0.37], [0, y, 0], ARMOR_WOOD[i % 2])),
      box([0.28, 0.025, 0.38], [0, 0.4, 0], GRIP),
      box([0.28, 0.025, 0.38], [0, 0.48, 0], GRIP),
      box([0.12, 0.05, 0.13], [0, 0.57, -0.2], ARMOR_WOOD[0]),
      box([0.12, 0.05, 0.13], [0, 0.57, 0.2], ARMOR_WOOD[0]),
    ],
    tip: null,
    flame: null,
  };
};

/**
 * Bone armor: ribs and pauldrons on the torso.
 * @param box Makes each box.
 * @returns The model.
 */
export const buildBoneArmor = (box: BoxFactory): GearModel => {
  return {
    parts: [
      box([0.24, 0.2, 0.33], [0, 0.44, 0], GRIP),
      ...[0.37, 0.43, 0.49].map((y: number): Mesh => box([0.27, 0.03, 0.36], [0.005, y, 0], ARMOR_BONE[0])),
      box([0.03, 0.18, 0.05], [0.14, 0.44, 0], ARMOR_BONE[1]),
      box([0.13, 0.08, 0.13], [0, 0.57, -0.2], ARMOR_BONE[1]),
      box([0.13, 0.08, 0.13], [0, 0.57, 0.2], ARMOR_BONE[1]),
      box([0.04, 0.09, 0.04], [0, 0.64, -0.22], ARMOR_BONE[0]),
      box([0.04, 0.09, 0.04], [0, 0.64, 0.22], ARMOR_BONE[0]),
    ],
    tip: null,
    flame: null,
  };
};

/**
 * Stone armor: heavy slabs on the torso.
 * @param box Makes each box.
 * @returns The model.
 */
export const buildStoneArmor = (box: BoxFactory): GearModel => {
  return {
    parts: [
      box([0.32, 0.26, 0.42], [0, 0.44, 0], ARMOR_STONE[0]),
      box([0.33, 0.06, 0.43], [0, 0.32, 0], ARMOR_STONE[1]),
      box([0.06, 0.12, 0.2], [0.15, 0.48, 0.06], ARMOR_STONE[1]),
      box([0.18, 0.12, 0.17], [0, 0.6, -0.22], ARMOR_STONE[0]),
      box([0.18, 0.12, 0.17], [0, 0.6, 0.22], ARMOR_STONE[0]),
    ],
    tip: null,
    flame: null,
  };
};
