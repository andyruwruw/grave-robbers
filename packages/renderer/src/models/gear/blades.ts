// Local Imports
import {
  BLADE,
  BONE,
  BONE_DARK,
  BRASS,
  EDGE,
  GRIP,
  HANDLE,
  IRON,
  PALE_WOOD,
  SILVER,
  STEEL,
  WRAP,
} from './config/palette';
import { headOf } from './helpers/head-of';

// Types
import type { Mesh } from 'three';
import type { BoxFactory, GearModel } from '../../types/models';

/**
 * The battle axe: a long haft and a broad iron head.
 * @param box Makes each box.
 * @returns The model.
 */
export const buildBattleAxe = (box: BoxFactory): GearModel => {
  const tip = box([0.045, 0.38, 0.06], [0.2, -0.62, 0], EDGE);
  const haft = box([0.055, 0.78, 0.055], [0, -0.36, 0], HANDLE);
  const head = [
    box([0.1, 0.2, 0.08], [0, -0.62, 0], IRON),
    box([0.14, 0.3, 0.05], [0.1, -0.62, 0], IRON),
    box([0.11, 0.26, 0.05], [-0.09, -0.62, 0], IRON),
    box([0.035, 0.3, 0.055], [-0.16, -0.62, 0], EDGE),
    tip,
  ];
  return {
    parts: [
      box([0.06, 0.1, 0.06], [0, 0, 0], GRIP),
      haft,
      box([0.03, 0.09, 0.03], [0, -0.78, 0], EDGE),
      ...head,
    ],
    tip,
    flame: null,
    head: headOf(head, 1, 0),
    haft,
  };
};

/**
 * The scythe: a long snath and a curved blade.
 * @param box Makes each box.
 * @returns The model.
 */
export const buildScythe = (box: BoxFactory): GearModel => {
  const tip = box([0.09, 0.035, 0.03], [-0.5, -0.76, 0], EDGE);
  tip.rotation.z = -0.95;
  /**
   * Builds a box tilted around z, for the curve of a blade.
   * @param size The box size.
   * @param pos Where it sits.
   * @param color Its color.
   * @param rz The tilt around z.
   * @returns The box.
   */
  const curve = (size: [number, number, number], pos: [number, number, number], color: string, rz: number): Mesh => {
    const mesh = box(size, pos, color);
    mesh.rotation.z = rz;
    return mesh;
  };
  const haft = box([0.045, 1.1, 0.045], [0, -0.4, 0], HANDLE);
  const head = [
    box([0.22, 0.085, 0.03], [-0.1, -0.94, 0], BLADE),
    curve([0.19, 0.07, 0.03], [-0.28, -0.9, 0], BLADE, -0.28),
    curve([0.15, 0.055, 0.03], [-0.42, -0.83, 0], BLADE, -0.6),
    curve([0.34, 0.02, 0.034], [-0.22, -0.885, 0], EDGE, -0.18),
    tip,
  ];
  return {
    parts: [
      box([0.06, 0.1, 0.06], [0, 0, 0], GRIP),
      haft,
      box([0.12, 0.035, 0.035], [0.05, -0.34, 0], GRIP),
      box([0.075, 0.08, 0.075], [0, -0.92, 0], IRON),
      ...head,
    ],
    tip,
    flame: null,
    head: headOf(head),
    haft,
  };
};

/**
 * The spear: a long shaft and an iron point.
 * @param box Makes each box.
 * @returns The model.
 */
export const buildSpear = (box: BoxFactory): GearModel => {
  const tip = box([0.045, 0.18, 0.035], [0, -0.95, 0], EDGE);
  const haft = box([0.04, 1, 0.04], [0, -0.32, 0], HANDLE);
  const head = [
    box([0.08, 0.05, 0.045], [0, -0.84, 0], IRON),
    box([0.02, 0.06, 0.02], [0, -1.06, 0], EDGE),
    tip,
  ];
  return {
    parts: [
      haft,
      box([0.055, 0.07, 0.055], [0, -0.68, 0], WRAP),
      ...head,
    ],
    tip,
    flame: null,
    head: headOf(head),
    haft,
  };
};

/**
 * The stake: a pale wooden spike tipped with silver.
 * @param box Makes each box.
 * @returns The model.
 */
export const buildStake = (box: BoxFactory): GearModel => {
  const tip = box([0.035, 0.1, 0.035], [0, -0.39, 0], SILVER);
  return {
    parts: [
      box([0.06, 0.1, 0.06], [0, 0, 0], GRIP),
      box([0.055, 0.32, 0.055], [0, -0.18, 0], PALE_WOOD),
      tip,
    ],
    tip,
    flame: null,
  };
};

/**
 * The ritual knife: a bone hilt and a curved silver blade.
 * @param box Makes each box.
 * @returns The model.
 */
export const buildRitualKnife = (box: BoxFactory): GearModel => {
  const tip = box([0.025, 0.07, 0.018], [0.065, -0.355, 0], EDGE);
  tip.rotation.z = 0.75;
  /**
   * Builds a box tilted around z, for the curve of a blade.
   * @param size The box size.
   * @param pos Where it sits.
   * @param color Its color.
   * @param rz The tilt around z.
   * @returns The box.
   */
  const curve = (size: [number, number, number], pos: [number, number, number], color: string, rz: number): Mesh => {
    const mesh = box(size, pos, color);
    mesh.rotation.z = rz;
    return mesh;
  };
  const haft = box([0.045, 0.16, 0.045], [0, 0.01, 0], BONE);
  const head = [
    box([0.06, 0.14, 0.018], [0.005, -0.16, 0], SILVER),
    curve([0.055, 0.12, 0.018], [0.03, -0.27, 0], SILVER, 0.3),
    curve([0.018, 0.24, 0.02], [0.05, -0.23, 0], EDGE, 0.2),
    tip,
  ];
  return {
    parts: [
      box([0.05, 0.05, 0.05], [0, 0.09, 0], BONE_DARK),
      haft,
      box([0.055, 0.03, 0.055], [0, 0.05, 0], WRAP),
      box([0.055, 0.03, 0.055], [0, -0.02, 0], WRAP),
      box([0.12, 0.025, 0.06], [0, -0.08, 0], BLADE),
      ...head,
    ],
    tip,
    flame: null,
    head: headOf(head),
    haft,
  };
};

/**
 * The short sword: a brass guard and a steel blade.
 * @param box Makes each box.
 * @returns The model.
 */
export const buildShortSword = (box: BoxFactory): GearModel => {
  const tip = box([0.035, 0.08, 0.026], [0, -0.58, 0], EDGE);
  const haft = box([0.045, 0.13, 0.045], [0, 0.01, 0], GRIP);
  const head = [
    box([0.065, 0.42, 0.024], [0, -0.3, 0], STEEL),
    box([0.016, 0.36, 0.03], [0, -0.28, 0], BLADE),
    tip,
  ];
  return {
    parts: [
      box([0.055, 0.05, 0.055], [0, 0.09, 0], IRON),
      haft,
      box([0.17, 0.035, 0.05], [0, -0.07, 0], BRASS),
      ...head,
    ],
    tip,
    flame: null,
    head: headOf(head),
    haft,
  };
};

/**
 * The greatsword: a long grip, a wide guard and a long blade.
 * @param box Makes each box.
 * @returns The model.
 */
export const buildGreatsword = (box: BoxFactory): GearModel => {
  const tip = box([0.05, 0.1, 0.03], [0, -1.02, 0], EDGE);
  const haft = box([0.05, 0.26, 0.05], [0, 0.02, 0], GRIP);
  const head = [
    box([0.09, 0.82, 0.028], [0, -0.56, 0], STEEL),
    box([0.02, 0.74, 0.034], [0, -0.53, 0], BLADE),
    tip,
  ];
  return {
    parts: [
      box([0.06, 0.06, 0.06], [0, 0.17, 0], IRON),
      haft,
      box([0.06, 0.04, 0.06], [0, -0.06, 0], WRAP),
      box([0.28, 0.045, 0.06], [0, -0.13, 0], IRON),
      ...head,
    ],
    tip,
    flame: null,
    head: headOf(head),
    haft,
  };
};

/**
 * The glaive: a long haft and a broad blade.
 * @param box Makes each box.
 * @returns The model.
 */
export const buildGlaive = (box: BoxFactory): GearModel => {
  const tip = box([0.035, 0.08, 0.03], [0.07, -1.18, 0], EDGE);
  const haft = box([0.045, 1.05, 0.045], [0, -0.32, 0], HANDLE);
  const head = [
    box([0.13, 0.3, 0.028], [0.04, -1.0, 0], STEEL),
    box([0.03, 0.32, 0.034], [0.11, -1.0, 0], EDGE),
    tip,
  ];
  return {
    parts: [
      haft,
      box([0.06, 0.07, 0.06], [0, -0.06, 0], WRAP),
      box([0.065, 0.06, 0.06], [0, -0.85, 0], IRON),
      box([0.09, 0.03, 0.03], [-0.06, -0.9, 0], IRON),
      ...head,
    ],
    tip,
    flame: null,
    head: headOf(head),
    haft,
  };
};
