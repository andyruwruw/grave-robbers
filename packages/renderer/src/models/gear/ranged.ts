// Packages
import { Group } from 'three';

// Local Imports
import {
  BAND,
  BLOODSTEEL,
  BLOODSTEEL_DARK,
  BOLT,
  BONE,
  BONE_DARK,
  BORE,
  DARK_WOOD,
  EDGE,
  HANDLE,
  IRON,
  MUSKET_BAND,
  MUSKET_IRON,
  MUSKET_ROD,
  MUSKET_WOOD,
  MUSKET_WOOD_DARK,
  PALE_WOOD,
  STRING,
  VIAL_BLOOD,
  VIAL_GLASS,
  WRAP,
} from './config/palette';

// Types
import type { Mesh } from 'three';
import type { BoxFactory, GearModel } from '../../types/models';

/**
 * The crossbow: a stock, a bow across it, and a nocked bolt.
 * @param box Makes each box.
 * @returns The model.
 */
export const buildCrossbow = (box: BoxFactory): GearModel => {
  const tip = box([0.03, 0.05, 0.03], [0, -0.56, 0], EDGE);
  return {
    parts: [
      box([0.06, 0.5, 0.07], [0, -0.2, 0], HANDLE),
      box([0.05, 0.05, 0.5], [0, -0.4, 0], DARK_WOOD),
      box([0.04, 0.08, 0.04], [0, -0.36, -0.25], DARK_WOOD),
      box([0.04, 0.08, 0.04], [0, -0.36, 0.25], DARK_WOOD),
      box([0.012, 0.012, 0.46], [0, -0.32, 0], STRING),
      box([0.02, 0.28, 0.02], [0.04, -0.4, 0], BOLT),
      tip,
    ],
    tip,
    flame: null,
  };
};

/**
 * The blood gun: a bone grip and a bloodsteel barrel with a glowing vial.
 * @param box Makes each box.
 * @returns The model.
 */
export const buildBloodGun = (box: BoxFactory): GearModel => {
  const tip = box([0.13, 0.05, 0.13], [0, -0.57, 0], BLOODSTEEL);
  return {
    parts: [
      box([0.08, 0.06, 0.1], [0, 0.17, 0], BONE_DARK),
      box([0.07, 0.16, 0.09], [0, 0.08, 0], BONE),
      box([0.06, 0.12, 0.07], [0, -0.05, 0], DARK_WOOD),
      box([0.04, 0.06, 0.03], [-0.05, -0.04, 0], IRON),
      box([0.065, 0.42, 0.065], [0, -0.3, 0], BLOODSTEEL),
      box([0.075, 0.03, 0.075], [0, -0.17, 0], BLOODSTEEL_DARK),
      box([0.075, 0.03, 0.075], [0, -0.38, 0], BLOODSTEEL_DARK),
      box([0.095, 0.05, 0.095], [0, -0.52, 0], BLOODSTEEL),
      box([0.09, 0.005, 0.09], [0, -0.597, 0], BORE),
      box([0.05, 0.02, 0.05], [0.06, -0.08, 0], VIAL_GLASS),
      box([0.04, 0.1, 0.04], [0.06, -0.14, 0], VIAL_BLOOD, true),
      box([0.05, 0.02, 0.05], [0.06, -0.2, 0], VIAL_GLASS),
      tip,
    ],
    tip,
    flame: null,
  };
};

/**
 * The bow: two bent limbs, a string and a nocked arrow.
 * @param box Makes each box.
 * @returns The model.
 */
export const buildBow = (box: BoxFactory): GearModel => {
  const tip = box([0.03, 0.05, 0.03], [0, -0.34, 0], EDGE);
  /**
   * Builds one bent limb of the bow.
   * @param side Which end (-1 or 1).
   * @returns The limb.
   */
  const limb = (side: number): Mesh => {
    const mesh = box([0.035, 0.035, 0.3], [0, -0.06, 0.16 * side], PALE_WOOD);
    mesh.rotation.x = -0.35 * side;
    return mesh;
  };
  return {
    parts: [
      box([0.05, 0.1, 0.06], [0, -0.1, 0], WRAP),
      limb(-1),
      limb(1),
      box([0.01, 0.01, 0.56], [0, 0.04, 0], STRING),
      box([0.02, 0.38, 0.02], [0, -0.13, 0], BOLT),
      tip,
    ],
    tip,
    flame: null,
  };
};

/**
 * The repeating crossbow: a stock, a bow and a turning drum of bolts.
 * @param box Makes each box.
 * @returns The model.
 */
export const buildRepeatingCrossbow = (box: BoxFactory): GearModel => {
  const tip = box([0.03, 0.05, 0.03], [0, -0.66, 0], EDGE);
  const drum = new Group();
  drum.position.set(0, -0.3, 0);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const stave = box([0.035, 0.2, 0.035], [Math.cos(a) * 0.065, 0, Math.sin(a) * 0.065], i % 2 ? IRON : DARK_WOOD);
    const nock = box([0.022, 0.06, 0.022], [Math.cos(a) * 0.065, -0.12, Math.sin(a) * 0.065], EDGE);
    drum.add(stave, nock);
  }
  drum.add(box([0.06, 0.24, 0.06], [0, 0, 0], BAND));
  return {
    parts: [
      box([0.06, 0.62, 0.07], [0, -0.24, 0], DARK_WOOD),
      box([0.05, 0.05, 0.54], [0, -0.52, 0], IRON),
      box([0.04, 0.09, 0.04], [0, -0.48, -0.27], DARK_WOOD),
      box([0.04, 0.09, 0.04], [0, -0.48, 0.27], DARK_WOOD),
      box([0.012, 0.012, 0.5], [0, -0.44, 0], STRING),
      box([0.09, 0.2, 0.1], [0.07, -0.1, 0], HANDLE),
      box([0.1, 0.03, 0.11], [0.07, 0, 0], BAND),
      box([0.025, 0.12, 0.025], [-0.08, -0.3, 0], IRON),
      box([0.06, 0.025, 0.025], [-0.11, -0.25, 0], IRON),
      drum,
      tip,
    ],
    tip,
    flame: null,
    spinner: drum,
  };
};

/**
 * The musket: a wooden stock and a long iron barrel.
 * @param box Makes each box.
 * @returns The model.
 */
export const buildMusket = (box: BoxFactory): GearModel => {
  const tip = box([0.05, 0.04, 0.05], [0.03, -1.08, 0], MUSKET_IRON);
  const butt = box([0.1, 0.2, 0.08], [-0.02, 0.2, 0], MUSKET_WOOD_DARK);
  butt.rotation.z = 0.25;
  return {
    parts: [
      butt,
      box([0.07, 0.2, 0.07], [0, 0.04, 0], MUSKET_WOOD),
      box([0.06, 0.62, 0.06], [0.005, -0.36, 0], MUSKET_WOOD),
      box([0.034, 0.95, 0.034], [0.035, -0.6, 0], MUSKET_IRON),
      box([0.012, 0.7, 0.012], [-0.02, -0.5, 0], MUSKET_ROD),
      box([0.05, 0.028, 0.05], [0.025, -0.3, 0], MUSKET_BAND),
      box([0.05, 0.028, 0.05], [0.025, -0.62, 0], MUSKET_BAND),
      box([0.03, 0.06, 0.025], [0.06, -0.06, 0], MUSKET_IRON),
      box([0.02, 0.04, 0.02], [0.08, -0.02, 0], MUSKET_IRON),
      box([0.05, 0.015, 0.04], [-0.03, -0.1, 0], MUSKET_BAND),
      box([0.03, 0.005, 0.03], [0.035, -1.1, 0], BORE),
      tip,
    ],
    tip,
    flame: null,
  };
};
