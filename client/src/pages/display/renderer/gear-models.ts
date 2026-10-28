// Types
import type { Mesh } from 'three';
import type { GearKind } from '@halloween/shared/gear';

export const HANDLE = '#5a3d24';
export const GRIP = '#2e2118';
export const IRON = '#6f747d';
export const EDGE = '#c9ced6';
const DARK_WOOD = '#3b2a1c';
const PALE_WOOD = '#b89a6a';
const SILVER = '#dfe4ea';
const WRAP = '#7a1f1f';
const STRING = '#d8d0bc';
const BOLT = '#c9b48a';
const SHIELD_WOOD = '#6b4a2b';
const BAND = '#4a4f57';
const PLATE = '#5d6470';
const PLATE_TRIM = '#8a919c';
const FLAME = '#ffb347';
const FLAME_CORE = '#fff0a8';
const BLADE = '#34373e';
const LANTERN_FRAME = '#15151b';
const LANTERN_GLASS = '#ffcf6b';
const BONE = '#e6dcc0';
const BONE_DARK = '#c8b994';
const BLOODSTEEL = '#7e1626';
const BLOODSTEEL_DARK = '#5c101a';
const BORE = '#120a0a';
const VIAL_GLASS = '#a8bcc4';
const VIAL_BLOOD = '#c8141f';
const RUST = '#7a4a2a';
const STEEL = '#aeb4bd';
const LEATHER = '#4a3222';
const BRASS = '#b08a3e';
const ARMOR_WOOD = ['#6e4a2c', '#5a3c22'];
const ARMOR_BONE = ['#e6dcc0', '#cfc19c'];
const ARMOR_STONE = ['#6b6f78', '#4f535b'];

/**
 * Makes one box: size, position, color, and whether it glows (unlit).
 */
export type BoxFactory = (size: [number, number, number], pos: [number, number, number], color: string, glow?: boolean) => Mesh;

/**
 * A piece of gear built from boxes, plus the parts the avatar animates: the
 * cutting edge (or point) that leaves the swing streak, and a flame.
 */
export interface GearModel {
  parts: Mesh[];
  tip: Mesh | null;
  flame: Mesh | null;
}

/**
 * Laid on the ground: rotation (x, z), offset, and scale for each model.
 */
export const GROUND_POSE: Record<GearKind, { rx: number; rz: number; offset: [number, number, number]; scale: number }> = {
  'wood-axe': { rx: 0, rz: Math.PI / 2, offset: [-0.3, 0.05, 0], scale: 0.85 },
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

/**
 * Builds a model. Weapons and the torch extend down -y from the hand at
 * the origin (the edge or point toward +x), the shield faces out along +z
 * from the forearm, and the plate sits on the torso at body height.
 */
export function buildGearModel(kind: GearKind | 'wood-axe', box: BoxFactory): GearModel {
  switch (kind) {
    case 'wood-axe': {
      const tip = box([0.04, 0.22, 0.055], [0.16, -0.5, 0], EDGE);
      return {
        parts: [
          box([0.06, 0.1, 0.06], [0, 0, 0], GRIP),
          box([0.05, 0.6, 0.05], [0, -0.28, 0], HANDLE),
          box([0.16, 0.16, 0.05], [0.07, -0.52, 0], IRON),
          box([0.08, 0.05, 0.04], [-0.06, -0.55, 0], IRON),
          tip,
        ],
        tip,
        flame: null,
      };
    }
    case 'battle-axe': {
      const tip = box([0.045, 0.38, 0.06], [0.2, -0.62, 0], EDGE);
      return {
        parts: [
          box([0.06, 0.1, 0.06], [0, 0, 0], GRIP),
          box([0.055, 0.78, 0.055], [0, -0.36, 0], HANDLE),
          box([0.1, 0.2, 0.08], [0, -0.62, 0], IRON),
          box([0.14, 0.3, 0.05], [0.1, -0.62, 0], IRON),
          box([0.11, 0.26, 0.05], [-0.09, -0.62, 0], IRON),
          box([0.035, 0.3, 0.055], [-0.16, -0.62, 0], EDGE),
          box([0.03, 0.09, 0.03], [0, -0.78, 0], EDGE),
          tip,
        ],
        tip,
        flame: null,
      };
    }
    case 'scythe': {
      const tip = box([0.09, 0.035, 0.03], [0.5, -0.76, 0], EDGE);
      tip.rotation.z = 0.95;
      const curve = (size: [number, number, number], pos: [number, number, number], color: string, rz: number): Mesh => {
        const mesh = box(size, pos, color);
        mesh.rotation.z = rz;
        return mesh;
      };
      return {
        parts: [
          box([0.06, 0.1, 0.06], [0, 0, 0], GRIP),
          box([0.045, 1.1, 0.045], [0, -0.4, 0], HANDLE),
          box([0.12, 0.035, 0.035], [-0.05, -0.34, 0], GRIP),
          box([0.075, 0.08, 0.075], [0, -0.92, 0], IRON),
          box([0.22, 0.085, 0.03], [0.1, -0.94, 0], BLADE),
          curve([0.19, 0.07, 0.03], [0.28, -0.9, 0], BLADE, 0.28),
          curve([0.15, 0.055, 0.03], [0.42, -0.83, 0], BLADE, 0.6),
          curve([0.34, 0.02, 0.034], [0.22, -0.885, 0], EDGE, 0.18),
          tip,
        ],
        tip,
        flame: null,
      };
    }
    case 'spear': {
      const tip = box([0.045, 0.18, 0.035], [0, -0.95, 0], EDGE);
      return {
        parts: [
          box([0.04, 1, 0.04], [0, -0.32, 0], HANDLE),
          box([0.055, 0.07, 0.055], [0, -0.68, 0], WRAP),
          box([0.08, 0.05, 0.045], [0, -0.84, 0], IRON),
          box([0.02, 0.06, 0.02], [0, -1.06, 0], EDGE),
          tip,
        ],
        tip,
        flame: null,
      };
    }
    case 'stake': {
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
    }
    case 'crossbow': {
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
    }
    case 'ritual-knife': {
      const tip = box([0.025, 0.07, 0.018], [0.065, -0.355, 0], EDGE);
      tip.rotation.z = 0.75;
      const curve = (size: [number, number, number], pos: [number, number, number], color: string, rz: number): Mesh => {
        const mesh = box(size, pos, color);
        mesh.rotation.z = rz;
        return mesh;
      };
      return {
        parts: [
          box([0.05, 0.05, 0.05], [0, 0.09, 0], BONE_DARK),
          box([0.045, 0.16, 0.045], [0, 0.01, 0], BONE),
          box([0.055, 0.03, 0.055], [0, 0.05, 0], WRAP),
          box([0.055, 0.03, 0.055], [0, -0.02, 0], WRAP),
          box([0.12, 0.025, 0.06], [0, -0.08, 0], BLADE),
          box([0.06, 0.14, 0.018], [0.005, -0.16, 0], SILVER),
          curve([0.055, 0.12, 0.018], [0.03, -0.27, 0], SILVER, 0.3),
          curve([0.018, 0.24, 0.02], [0.05, -0.23, 0], EDGE, 0.2),
          tip,
        ],
        tip,
        flame: null,
      };
    }
    case 'blood-gun': {
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
    }
    case 'torch': {
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
    }
    case 'shield':
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
    case 'plate':
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
    case 'wood-armor':
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
    case 'bone-armor':
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
    case 'stone-armor':
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
    case 'stick': {
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
    }
    case 'femur': {
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
    }
    case 'short-sword': {
      const tip = box([0.035, 0.08, 0.026], [0, -0.58, 0], EDGE);
      return {
        parts: [
          box([0.055, 0.05, 0.055], [0, 0.09, 0], IRON),
          box([0.045, 0.13, 0.045], [0, 0.01, 0], GRIP),
          box([0.17, 0.035, 0.05], [0, -0.07, 0], BRASS),
          box([0.065, 0.42, 0.024], [0, -0.3, 0], STEEL),
          box([0.016, 0.36, 0.03], [0, -0.28, 0], BLADE),
          tip,
        ],
        tip,
        flame: null,
      };
    }
    case 'greatsword': {
      const tip = box([0.05, 0.1, 0.03], [0, -1.02, 0], EDGE);
      return {
        parts: [
          box([0.06, 0.06, 0.06], [0, 0.17, 0], IRON),
          box([0.05, 0.26, 0.05], [0, 0.02, 0], GRIP),
          box([0.06, 0.04, 0.06], [0, -0.06, 0], WRAP),
          box([0.28, 0.045, 0.06], [0, -0.13, 0], IRON),
          box([0.09, 0.82, 0.028], [0, -0.56, 0], STEEL),
          box([0.02, 0.74, 0.034], [0, -0.53, 0], BLADE),
          tip,
        ],
        tip,
        flame: null,
      };
    }
    case 'flail': {
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
    }
    case 'morning-star': {
      const tip = box([0.04, 0.06, 0.04], [0, -0.7, 0], EDGE);
      return {
        parts: [
          box([0.06, 0.1, 0.06], [0, 0, 0], GRIP),
          box([0.06, 0.5, 0.06], [0, -0.25, 0], HANDLE),
          box([0.07, 0.04, 0.07], [0, -0.48, 0], IRON),
          box([0.16, 0.17, 0.16], [0, -0.58, 0], IRON),
          box([0.06, 0.05, 0.05], [0.11, -0.58, 0], EDGE),
          box([0.06, 0.05, 0.05], [-0.11, -0.58, 0], EDGE),
          box([0.05, 0.05, 0.06], [0, -0.58, 0.11], EDGE),
          box([0.05, 0.05, 0.06], [0, -0.58, -0.11], EDGE),
          box([0.05, 0.05, 0.05], [0.08, -0.5, 0.08], EDGE),
          box([0.05, 0.05, 0.05], [-0.08, -0.66, -0.08], EDGE),
          tip,
        ],
        tip,
        flame: null,
      };
    }
    case 'warhammer': {
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
    }
    case 'quarterstaff': {
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
    }
    case 'glaive': {
      const tip = box([0.035, 0.08, 0.03], [0.07, -1.18, 0], EDGE);
      return {
        parts: [
          box([0.045, 1.05, 0.045], [0, -0.32, 0], HANDLE),
          box([0.06, 0.07, 0.06], [0, -0.06, 0], WRAP),
          box([0.065, 0.06, 0.06], [0, -0.85, 0], IRON),
          box([0.13, 0.3, 0.028], [0.04, -1.0, 0], STEEL),
          box([0.03, 0.32, 0.034], [0.11, -1.0, 0], EDGE),
          box([0.09, 0.03, 0.03], [-0.06, -0.9, 0], IRON),
          tip,
        ],
        tip,
        flame: null,
      };
    }
    case 'spiked-gauntlet': {
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
    }
    case 'bow': {
      const tip = box([0.03, 0.05, 0.03], [0, -0.34, 0], EDGE);
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
    }
    case 'repeating-crossbow': {
      const tip = box([0.03, 0.05, 0.03], [0, -0.58, 0], EDGE);
      return {
        parts: [
          box([0.06, 0.52, 0.07], [0, -0.2, 0], DARK_WOOD),
          box([0.05, 0.05, 0.5], [0, -0.42, 0], IRON),
          box([0.04, 0.08, 0.04], [0, -0.38, -0.25], DARK_WOOD),
          box([0.04, 0.08, 0.04], [0, -0.38, 0.25], DARK_WOOD),
          box([0.012, 0.012, 0.46], [0, -0.34, 0], STRING),
          box([0.09, 0.2, 0.1], [0.07, -0.26, 0], HANDLE),
          box([0.1, 0.03, 0.11], [0.07, -0.15, 0], BAND),
          box([0.025, 0.22, 0.025], [-0.06, -0.18, 0], IRON),
          box([0.02, 0.28, 0.02], [0.04, -0.42, 0], BOLT),
          tip,
        ],
        tip,
        flame: null,
      };
    }
    case 'musket': {
      const tip = box([0.06, 0.04, 0.06], [0.02, -0.86, 0], BLOODSTEEL_DARK);
      return {
        parts: [
          box([0.08, 0.22, 0.09], [0, 0.12, 0], DARK_WOOD),
          box([0.06, 0.42, 0.07], [0, -0.17, 0], HANDLE),
          box([0.045, 0.62, 0.045], [0.02, -0.55, 0], BLOODSTEEL),
          box([0.055, 0.03, 0.055], [0.02, -0.4, 0], BRASS),
          box([0.055, 0.03, 0.055], [0.02, -0.7, 0], BRASS),
          box([0.04, 0.06, 0.03], [-0.04, -0.05, 0], IRON),
          box([0.04, 0.005, 0.04], [0.02, -0.882, 0], BORE),
          tip,
        ],
        tip,
        flame: null,
      };
    }
    case 'shovel': {
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
    }
  }
}

/**
 * The lantern every player carries when nothing else is in their off hand,
 * hanging down -y from the hand at the origin.
 */
export function buildLantern(box: BoxFactory): Mesh[] {
  return [
    box([0.02, 0.05, 0.02], [0, -0.26, 0], LANTERN_FRAME),
    box([0.11, 0.03, 0.11], [0, -0.29, 0], LANTERN_FRAME),
    box([0.08, 0.1, 0.08], [0, -0.35, 0], LANTERN_GLASS, true),
    box([0.11, 0.02, 0.11], [0, -0.41, 0], LANTERN_FRAME),
  ];
}
