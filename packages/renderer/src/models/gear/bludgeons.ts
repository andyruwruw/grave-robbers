// Packages
import { Mesh } from 'three';

// Local Imports
import {
  BAND,
  BONE,
  BONE_DARK,
  DARK_WOOD,
  EDGE,
  GRIP,
  HANDLE,
  IRON,
  LEATHER,
  PALE_WOOD,
  RUST,
  WRAP,
} from './config/palette';
import { buildWhip } from './whip';

// Types
import type { Object3D } from 'three';
import type { BoxFactory, GearModel } from '../../types/models';

/**
 * The builder's hammer: a short handle and an iron head with a claw.
 * @param box Makes each box.
 * @returns The model.
 */
export const buildHammer = (box: BoxFactory): GearModel => {
  const tip = box([0.05, 0.1, 0.1], [0.15, -0.5, 0], EDGE);
  return {
    parts: [
      box([0.06, 0.1, 0.06], [0, 0, 0], GRIP),
      box([0.05, 0.5, 0.05], [0, -0.24, 0], HANDLE),
      box([0.22, 0.09, 0.09], [0.03, -0.5, 0], IRON),
      box([0.06, 0.04, 0.03], [-0.11, -0.47, 0.025], IRON),
      box([0.06, 0.04, 0.03], [-0.11, -0.47, -0.025], IRON),
      tip,
    ],
    tip,
    flame: null,
  };
};

/**
 * A stick: a crooked branch with a twig.
 * @param box Makes each box.
 * @returns The model.
 */
export const buildStick = (box: BoxFactory): GearModel => {
  const tip = box([0.04, 0.06, 0.04], [0.02, -0.62, 0], PALE_WOOD);
  const twig = box([0.025, 0.14, 0.025], [0.06, -0.36, 0], DARK_WOOD);
  twig.rotation.z = 0.7;
  return {
    parts: [
      box([0.055, 0.32, 0.055], [0, -0.14, 0], DARK_WOOD),
      box([0.05, 0.3, 0.05], [0.015, -0.44, 0], HANDLE),
      box([0.065, 0.05, 0.065], [0.01, -0.3, 0], DARK_WOOD),
      twig,
      tip,
    ],
    tip,
    flame: null,
  };
};

/**
 * A femur: a thick bone club.
 * @param box Makes each box.
 * @returns The model.
 */
export const buildFemur = (box: BoxFactory): GearModel => {
  const tip = box([0.09, 0.08, 0.13], [0, -0.5, 0], BONE);
  return {
    parts: [
      box([0.09, 0.08, 0.1], [0, 0, 0], BONE_DARK),
      box([0.065, 0.44, 0.065], [0, -0.24, 0], BONE),
      box([0.07, 0.06, 0.07], [0.005, -0.38, 0], BONE_DARK),
      box([0.08, 0.07, 0.07], [0.02, -0.55, -0.04], BONE_DARK),
      tip,
    ],
    tip,
    flame: null,
  };
};

/**
 * The flail: a handle, a short chain and a spiked iron ball.
 * @param box Makes each box.
 * @returns The model.
 */
export const buildFlail = (box: BoxFactory): GearModel => {
  const tip = box([0.14, 0.14, 0.14], [0.02, -0.56, 0], IRON);
  return {
    parts: [
      box([0.06, 0.08, 0.06], [0, 0, 0], GRIP),
      box([0.05, 0.3, 0.05], [0, -0.17, 0], HANDLE),
      box([0.06, 0.04, 0.06], [0, -0.33, 0], IRON),
      box([0.03, 0.05, 0.03], [0, -0.38, 0], IRON),
      box([0.03, 0.05, 0.03], [0.01, -0.43, 0], IRON),
      box([0.03, 0.05, 0.03], [0.015, -0.48, 0], IRON),
      tip,
      box([0.05, 0.04, 0.04], [0.12, -0.56, 0], EDGE),
      box([0.05, 0.04, 0.04], [-0.08, -0.56, 0], EDGE),
      box([0.04, 0.04, 0.05], [0.02, -0.56, 0.1], EDGE),
      box([0.04, 0.04, 0.05], [0.02, -0.56, -0.1], EDGE),
      box([0.04, 0.05, 0.04], [0.02, -0.66, 0], EDGE),
    ],
    tip,
    flame: null,
  };
};

/**
 * The morning star: the whip (see `buildWhip`) laid out in a gentle curve.
 * @param box Makes each box.
 * @returns The model.
 */
export const buildMorningStar = (box: BoxFactory): GearModel => {
  const whip = buildWhip(box);
  for (const [i, joint] of whip.joints.entries()) {
    joint.rotation.z = i === 0 ? 0.5 : 0.32;
  }
  whip.root.updateMatrixWorld(true);
  const parts: Mesh[] = [];
  whip.root.traverse((o: Object3D): void => {
    if (o instanceof Mesh) {
      o.matrixWorld.decompose(o.position, o.quaternion, o.scale);
      parts.push(o);
    }
  });
  return { parts, tip: whip.tip, flame: null };
};

/**
 * The warhammer: a long haft and a heavy iron head with a spike.
 * @param box Makes each box.
 * @returns The model.
 */
export const buildWarhammer = (box: BoxFactory): GearModel => {
  const tip = box([0.035, 0.15, 0.15], [0.17, -0.62, 0], EDGE);
  return {
    parts: [
      box([0.06, 0.1, 0.06], [0, 0, 0], GRIP),
      box([0.055, 0.66, 0.055], [0, -0.3, 0], HANDLE),
      box([0.27, 0.13, 0.13], [0.02, -0.62, 0], IRON),
      box([0.29, 0.03, 0.14], [0.02, -0.55, 0], BAND),
      box([0.11, 0.045, 0.045], [-0.17, -0.62, 0], EDGE),
      box([0.03, 0.08, 0.03], [0, -0.72, 0], EDGE),
      tip,
    ],
    tip,
    flame: null,
  };
};

/**
 * The quarterstaff: a long pale staff with iron caps.
 * @param box Makes each box.
 * @returns The model.
 */
export const buildQuarterstaff = (box: BoxFactory): GearModel => {
  const tip = box([0.06, 0.07, 0.06], [0, -0.9, 0], IRON);
  return {
    parts: [
      box([0.05, 1.25, 0.05], [0, -0.27, 0], PALE_WOOD),
      box([0.06, 0.07, 0.06], [0, 0.36, 0], IRON),
      box([0.06, 0.08, 0.06], [0, 0.02, 0], WRAP),
      box([0.06, 0.08, 0.06], [0, -0.4, 0], WRAP),
      tip,
    ],
    tip,
    flame: null,
  };
};

/**
 * The spiked gauntlet: a leather and iron fist with blades.
 * @param box Makes each box.
 * @returns The model.
 */
export const buildSpikedGauntlet = (box: BoxFactory): GearModel => {
  const tip = box([0.1, 0.025, 0.025], [0.12, -0.05, 0], EDGE);
  return {
    parts: [
      box([0.11, 0.13, 0.11], [0, 0.07, 0], LEATHER),
      box([0.13, 0.1, 0.13], [0.01, -0.04, 0], IRON),
      box([0.14, 0.03, 0.14], [0.01, 0.01, 0], BAND),
      box([0.09, 0.025, 0.025], [0.11, -0.05, -0.045], EDGE),
      box([0.09, 0.025, 0.025], [0.11, -0.05, 0.045], EDGE),
      tip,
    ],
    tip,
    flame: null,
  };
};

/**
 * The shovel: a grip, a handle and a tilted iron blade.
 * @param box Makes each box.
 * @returns The model.
 */
export const buildShovel = (box: BoxFactory): GearModel => {
  const tip = box([0.15, 0.03, 0.035], [0.02, -0.79, 0.03], EDGE);
  const blade = box([0.16, 0.18, 0.03], [0.02, -0.68, 0.01], IRON);
  blade.rotation.x = 0.3;
  tip.rotation.x = 0.3;
  return {
    parts: [
      box([0.14, 0.04, 0.05], [0, 0.02, 0], GRIP),
      box([0.05, 0.62, 0.05], [0, -0.3, 0], HANDLE),
      blade,
      box([0.08, 0.06, 0.032], [-0.02, -0.66, 0.02], RUST),
      tip,
    ],
    tip,
    flame: null,
  };
};
