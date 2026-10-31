// Packages
import { Group } from 'three';

// Local Imports
import { GOURD, SHELL, TWINE } from '../../config/blunt-palette';
import {
  HOLY_CLOTH,
  HOLY_GOLD,
  HOLY_GOLD_DARK,
  HOLY_HALO,
  HOLY_SILVER,
} from '../../config/essence-palette';

// Types
import type { VariantId, VariantShape } from '../../types/variant-shape';
import type { VariantDecor } from '../../variant-decor';

/**
 * How far round the crozier's crook curls, in radians.
 */
const CROOK_TURN = Math.PI * 1.6;

/**
 * Boxes in the crozier's crook.
 */
const CROOK_SEGMENTS = 12;

/**
 * Pilgrim's Staff: a water gourd swinging on twine below the head, a
 * scallop shell pinned to the staff, and a small silver cross topping
 * its other end. The head is the staff's far end, at the head's middle,
 * with the staff running up +y toward the hand.
 * @param decor The model being decorated.
 */
const pilgrimsStaff = (decor: VariantDecor): void => {
  const gourd = new Group();
  gourd.position.set(0.032, 0.2, 0);
  gourd.add(
    decor.box([0.006, 0.05, 0.006], [0, -0.025, 0], TWINE),
    decor.box([0.012, 0.012, 0.012], [0, -0.052, 0], TWINE),
    decor.box([0.026, 0.028, 0.026], [0, -0.07, 0], GOURD),
    decor.box([0.046, 0.05, 0.046], [0, -0.108, 0], GOURD),
  );
  decor.head.add(gourd);
  const shell = new Group();
  shell.position.set(0, 0.32, 0.031);
  shell.add(decor.box([0.022, 0.012, 0.008], [0, -0.018, 0], SHELL));
  for (const turn of [-0.5, 0, 0.5]) {
    const rib = decor.box([0.013, 0.042, 0.008], [-Math.sin(turn) * 0.012, 0, 0], SHELL);
    rib.rotation.z = turn;
    shell.add(rib);
  }
  decor.head.add(shell);
  decor.addToModel(decor.box([0.02, 0.09, 0.02], [0, 0.43, 0], HOLY_SILVER));
  decor.addToModel(decor.box([0.07, 0.02, 0.02], [0, 0.45, 0], HOLY_SILVER));
  decor.animate((time: number): void => {
    gourd.rotation.z = Math.sin(time * 1.9) * 0.3;
    gourd.rotation.x = Math.sin(time * 1.3 + 1) * 0.2;
  });
};

/**
 * Bishop's Crozier: the far end grows a knop and a gold crook curling
 * back on itself round a glowing gem, with a white veil hanging from the
 * knop.
 * @param decor The model being decorated.
 */
const bishopsCrozier = (decor: VariantDecor): void => {
  const end = -decor.size[1] / 2;
  decor.add([0.075, 0.05, 0.075], [0, end - 0.015, 0], HOLY_GOLD_DARK);
  decor.add([0.03, 0.13, 0.03], [0, end - 0.085, 0], HOLY_GOLD);
  const r = 0.075;
  const cy = end - 0.15;
  const step = CROOK_TURN / CROOK_SEGMENTS;
  for (let i = 0; i < CROOK_SEGMENTS; i++) {
    const turn = Math.PI + (i + 0.5) * step;
    const thick = 0.03 - (i / CROOK_SEGMENTS) * 0.01;
    const seg = decor.add([r * step * 1.3, thick, thick], [r + Math.cos(turn) * r, cy + Math.sin(turn) * r, 0], HOLY_GOLD);
    seg.rotation.z = Math.atan2(Math.cos(turn), -Math.sin(turn));
  }
  const last = Math.PI + CROOK_TURN;
  decor.add([0.034, 0.034, 0.034], [r + Math.cos(last) * r, cy + Math.sin(last) * r, 0], HOLY_GOLD_DARK);
  decor.add([0.032, 0.032, 0.032], [r, cy, 0], HOLY_HALO, true);
  const veil = new Group();
  veil.position.set(-0.045, end - 0.01, 0);
  veil.add(decor.box([0.04, 0.15, 0.006], [0, 0.075, 0], HOLY_CLOTH), decor.box([0.044, 0.012, 0.008], [0, 0.15, 0], HOLY_GOLD));
  decor.head.add(veil);
  decor.animate((time: number): void => {
    veil.rotation.z = 0.15 + Math.sin(time * 1.7) * 0.12;
    veil.rotation.x = Math.sin(time * 1.2) * 0.15;
  });
};

/**
 * The holy quarterstaff's own twists, by variant.
 */
export const STAFF_SHAPES: Partial<Record<VariantId, VariantShape>> = {
  'quarterstaff@holy1': pilgrimsStaff,
  'quarterstaff@holy2': bishopsCrozier,
};
