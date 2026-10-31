// Local Imports
import {
  LAVA,
  LAVA_HOT,
  MIRROR,
  MIRROR_GLINT,
  MIRROR_RIM,
  OBSIDIAN,
  OBSIDIAN_SHEEN,
} from '../config/essence-palette';
import { SULFUR } from '../config/ranged-palette';
import { boxEnd } from '../helpers/model-boxes';
import { BOW_SHAPES } from './bow-shapes';
import { CROSSBOW_SHAPES } from './crossbow-shapes';
import { GUN_SHAPES } from './gun-shapes';

// Types
import type { Mesh } from 'three';
import type { VariantId, VariantShape } from '../types/variant-shape';
import type { VariantDecor } from '../variant-decor';

/**
 * The names of the axes, for turning a box about one.
 */
const AXES = ['x', 'y', 'z'] as const;

/**
 * The Mirror Shield's extras on top of the silver look's mirror: a raised
 * mirrored diamond boss, rays engraved out from it, studded corners, and
 * a star of light twinkling on the boss.
 * @param decor The shield being decorated.
 */
const mirrorShield = (decor: VariantDecor): void => {
  const t = decor.depth / 2 + 0.004;
  const long = decor.length * 0.84;
  const wide = decor.width * 0.84;
  const turn = AXES[decor.thick];
  decor.add(decor.vec(0.085, 0.085, 0.02), decor.vec(0, 0, t + 0.01), MIRROR_RIM).rotation[turn] = Math.PI / 4;
  decor.add(decor.vec(0.055, 0.055, 0.012), decor.vec(0, 0, t + 0.018), MIRROR).rotation[turn] = Math.PI / 4;
  const ray = Math.min(long, wide) * 0.3;
  const r = 0.07 + ray / 2;
  for (const side of [-1, 1]) {
    decor.add(decor.vec(ray, 0.008, 0.004), decor.vec(side * r, 0, t + 0.006), MIRROR_RIM);
    decor.add(decor.vec(0.008, ray, 0.004), decor.vec(0, side * r, t + 0.006), MIRROR_RIM);
    for (const other of [-1, 1]) {
      decor.add(decor.vec(0.035, 0.035, 0.02), decor.vec(side * long / 2, other * wide / 2, t + 0.004), MIRROR_RIM);
    }
  }
  const star = [
    decor.add(decor.vec(0.05, 0.007, 0.004), decor.vec(0, 0, t + 0.026), MIRROR_GLINT, true),
    decor.add(decor.vec(0.007, 0.05, 0.004), decor.vec(0, 0, t + 0.026), MIRROR_GLINT, true),
  ];
  const sizes = star.map((mesh: Mesh) => mesh.scale.clone());
  decor.animate((time: number): void => {
    const s = Math.max(0, Math.sin(time * 2.3)) ** 4;
    star.forEach((mesh: Mesh, i: number): void => {
      mesh.visible = s > 0.05;
      mesh.scale.copy(sizes[i]).multiplyScalar(Math.max(s, 0.05));
      mesh.scale.setComponent(decor.thick, sizes[i].getComponent(decor.thick));
    });
  });
};

/**
 * The Brimstone Torch's horned crown: obsidian prongs leaning out round
 * the flame, each tipped with a glowing coal and a fleck of sulfur.
 * @param decor The torch being decorated.
 */
const brimstoneCrown = (decor: VariantDecor): void => {
  for (let i = 0; i < 4; i++) {
    const turn = (i / 4) * Math.PI * 2;
    const x = Math.cos(turn);
    const z = Math.sin(turn);
    const prong = decor.add([0.02, 0.11, 0.02], [x * 0.065, -0.085, z * 0.065], OBSIDIAN_SHEEN);
    prong.rotation.set(-z * 0.35, 0, x * 0.35);
    const end = boxEnd(prong, 1, -1);
    decor.add([0.024, 0.024, 0.024], [end.x, end.y, end.z], LAVA, true);
    decor.add([0.014, 0.014, 0.014], [end.x * 0.8, end.y + 0.02, end.z * 0.8], SULFUR);
  }
};

/**
 * The ranged weapons', shield's, and torch's own twists on their essence's
 * look (bow, crossbow, repeating crossbow, blood gun, musket, shield,
 * torch), by variant. The bow's, crossbows', and guns' live in their own
 * files.
 */
export const RANGED_SHAPES: Partial<Record<VariantId, VariantShape>> = {
  ...BOW_SHAPES,
  ...CROSSBOW_SHAPES,
  ...GUN_SHAPES,
  'shield@silver1': mirrorShield,
  'torch@brimstone1': (decor: VariantDecor): void => {
    brimstoneCrown(decor);
    const { flame } = decor.model;
    if (flame) {
      flame.scale.multiplyScalar(1.3);
      flame.position.y -= 0.03;
    }
    for (let i = 0; i < 4; i++) {
      const turn = (i / 4) * Math.PI * 2 + 0.4;
      const lump = decor.add([0.04, 0.035, 0.04], [Math.cos(turn) * 0.045, -0.02, Math.sin(turn) * 0.045], OBSIDIAN);
      lump.rotation.y = turn;
    }
    decor.add([0.05, 0.012, 0.05], [0, -0.038, 0], LAVA, true);
    const crown: Mesh = decor.add([0.13, 0.05, 0.13], [0, -0.1, 0], LAVA_HOT, true, 0.5);
    decor.animate((time: number): void => {
      const s = 1 + Math.sin(time * 17) * 0.12 + Math.sin(time * 29 + 1) * 0.08;
      crown.scale.set(0.13 * s, 0.05 * (2 - s), 0.13 * s);
    });
  },
};
