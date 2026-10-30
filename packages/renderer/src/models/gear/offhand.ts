// Local Imports
import {
  BAND,
  DARK_WOOD,
  EDGE,
  FLAME,
  FLAME_CORE,
  HANDLE,
  SHIELD_WOOD,
} from './config/palette';

// Types
import type { BoxFactory, GearModel } from '../../types/models';

/**
 * The torch: a handle and a burning flame.
 * @param box Makes each box.
 * @returns The model.
 */
export const buildTorch = (box: BoxFactory): GearModel => {
  const flame = box([0.11, 0.15, 0.11], [0, -0.47, 0], FLAME, true);
  return {
    parts: [
      box([0.05, 0.4, 0.05], [0, -0.16, 0], HANDLE),
      box([0.075, 0.08, 0.075], [0, -0.36, 0], DARK_WOOD),
      box([0.06, 0.08, 0.06], [0, -0.45, 0], FLAME_CORE, true),
      flame,
    ],
    tip: null,
    flame,
  };
};

/**
 * The shield: banded boards facing out from the forearm.
 * @param box Makes each box.
 * @returns The model.
 */
export const buildShield = (box: BoxFactory): GearModel => {
  return {
    parts: [
      box([0.32, 0.34, 0.05], [0.02, -0.16, 0.07], SHIELD_WOOD),
      box([0.34, 0.04, 0.06], [0.02, 0.01, 0.07], BAND),
      box([0.34, 0.04, 0.06], [0.02, -0.33, 0.07], BAND),
      box([0.33, 0.05, 0.055], [0.02, -0.16, 0.08], BAND),
      box([0.08, 0.08, 0.04], [0.02, -0.16, 0.11], EDGE),
    ],
    tip: null,
    flame: null,
  };
};
