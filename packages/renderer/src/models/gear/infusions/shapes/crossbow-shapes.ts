// Packages
import { Group } from 'three';

// Local Imports
import { BAND, BONE, BONE_DARK } from '../../config/palette';
import {
  HOLY_GOLD,
  HOLY_GOLD_DARK,
  HOLY_HALO,
  HOLY_SILVER,
  SINEW,
} from '../config/essence-palette';
import { HOLLOW, STAKE } from '../config/ranged-palette';
import {
  findBox,
  findBoxes,
  putBox,
  swapBox,
} from '../helpers/model-boxes';

// Types
import type { Mesh } from 'three';
import type { VariantId, VariantShape } from '../types/variant-shape';
import type { VariantDecor } from '../variant-decor';

/**
 * The crossbow's nocked bolt.
 */
const BOLT_SHAFT: [number, number, number] = [0.02, 0.28, 0.02];

/**
 * The crossbow's prod (its bow).
 */
const PROD: [number, number, number] = [0.05, 0.05, 0.5];

/**
 * The repeating crossbow's prod.
 */
const REPEATER_PROD: [number, number, number] = [0.05, 0.05, 0.54];

/**
 * One stave of the repeating crossbow's drum.
 */
const STAVE: [number, number, number] = [0.035, 0.2, 0.035];

/**
 * The drum's core.
 */
const DRUM_CORE: [number, number, number] = [0.06, 0.24, 0.06];

/**
 * A silver bolt: a silver shaft and a cross-shaped silver head.
 * @param decor The crossbow being decorated.
 */
const silverBolt = (decor: VariantDecor): void => {
  const shaft = findBox(decor, BOLT_SHAFT);
  if (shaft) {
    swapBox(decor, shaft, { color: HOLY_SILVER });
  }
  const tip = decor.model.tip;
  if (tip) {
    const { x, y, z } = swapBox(decor, tip, { color: HOLY_SILVER }).position;
    putBox(decor, [0.075, 0.014, 0.014], [x, y + 0.008, z], HOLY_SILVER);
  }
};

/**
 * The Silver Bolter: a silver bolt, silver caps on the prod's ends, and
 * two spare silver bolts clipped along the stock.
 * @param decor The crossbow being decorated.
 */
const silverBolter = (decor: VariantDecor): void => {
  silverBolt(decor);
  const prod = findBox(decor, PROD);
  if (prod) {
    for (const side of [-1, 1]) {
      decor.add([0.065, 0.065, 0.03], [prod.position.x, prod.position.y, prod.position.z + side * (prod.scale.z / 2 + 0.005)], HOLY_SILVER);
    }
  }
  const haft = decor.model.haft;
  if (!haft) {
    return;
  }
  const x = haft.position.x - haft.scale.x / 2 - 0.012;
  const y = haft.position.y - 0.02;
  for (const z of [-0.02, 0.02]) {
    putBox(decor, [0.014, 0.24, 0.014], [x, y, z], HOLY_SILVER);
    putBox(decor, [0.024, 0.03, 0.024], [x, y - 0.135, z], HOLY_SILVER);
  }
  putBox(decor, [0.03, 0.022, 0.075], [x, y + 0.05, 0], BAND);
};

/**
 * The Hunter's Arbalest: a silver-tipped wooden stake for a bolt, gold
 * recurves on the prod, a windlass crank at the butt, and a ring sight
 * (it aims twice as fast).
 * @param decor The crossbow being decorated.
 */
const huntersArbalest = (decor: VariantDecor): void => {
  const shaft = findBox(decor, BOLT_SHAFT);
  if (shaft) {
    const stake = swapBox(decor, shaft, { color: STAKE });
    stake.scale.x *= 1.8;
    stake.scale.z *= 1.8;
  }
  const tip = decor.model.tip;
  if (tip) {
    const { x, y, z } = swapBox(decor, tip, { color: HOLY_SILVER }).position;
    putBox(decor, [0.016, 0.03, 0.016], [x, y - 0.035, z], HOLY_SILVER);
  }
  const prod = findBox(decor, PROD);
  if (prod) {
    for (const side of [-1, 1]) {
      const curl = decor.add([0.035, 0.08, 0.035], [prod.position.x, prod.position.y - 0.03, prod.position.z + side * (prod.scale.z / 2 + 0.02)], HOLY_GOLD_DARK);
      curl.rotation.x = -side * 0.5;
    }
  }
  const haft = decor.model.haft;
  if (!haft) {
    return;
  }
  const { x, y } = haft.position;
  const butt = y + haft.scale.y / 2 + 0.025;
  putBox(decor, [0.05, 0.05, 0.1], [x, butt, 0], HOLY_GOLD_DARK);
  putBox(decor, [0.012, 0.012, 0.19], [x, butt, 0], HOLY_GOLD);
  for (const side of [-1, 1]) {
    putBox(decor, [0.06, 0.012, 0.012], [x + 0.03, butt, side * 0.095], HOLY_GOLD);
    putBox(decor, [0.012, 0.012, 0.045], [x + 0.06, butt, side * 0.1], HOLY_GOLD);
  }
  const face = x + haft.scale.x / 2;
  const sightY = y - haft.scale.y * 0.15;
  putBox(decor, [0.05, 0.012, 0.012], [face + 0.025, sightY, 0], HOLY_GOLD_DARK);
  for (const side of [-1, 1]) {
    putBox(decor, [0.008, 0.008, 0.048], [face + 0.055, sightY + side * 0.02, 0], HOLY_GOLD);
    putBox(decor, [0.008, 0.048, 0.008], [face + 0.055, sightY, side * 0.02], HOLY_GOLD);
  }
  putBox(decor, [0.01, 0.01, 0.01], [face + 0.055, sightY, 0], HOLY_HALO, true);
};

/**
 * The repeating crossbow's drum turned to a ring of bone pipes, each with
 * a dark singing mouth (the Bone Choir).
 * @param decor The repeating crossbow being decorated.
 */
const boneDrum = (decor: VariantDecor): void => {
  const drum = decor.model.spinner;
  if (!drum) {
    return;
  }
  findBoxes([drum], STAVE).forEach((stave: Mesh, i: number): void => {
    const pipe = decor.restyle(stave, { color: i % 2 ? BONE_DARK : BONE });
    const turn = Math.atan2(pipe.position.z, pipe.position.x);
    const reach = Math.hypot(pipe.position.x, pipe.position.z) + pipe.scale.x / 2;
    const mouth = decor.box([0.012, 0.03, 0.02], [Math.cos(turn) * reach, 0.03, Math.sin(turn) * reach], HOLLOW);
    mouth.rotation.y = -turn;
    const foot = decor.box([0.045, 0.02, 0.045], [pipe.position.x, -pipe.scale.y / 2 + 0.01, pipe.position.z], BONE_DARK);
    foot.rotation.y = -turn;
    drum.add(mouth, foot);
  });
  for (const core of findBoxes([drum], DRUM_CORE)) {
    decor.restyle(core, { color: BONE_DARK });
  }
};

/**
 * A little skull capping the butt of the stock.
 * @param decor The repeating crossbow being decorated.
 * @returns Its jaw, or null when the model has no stock.
 */
const skullPommel = (decor: VariantDecor): Mesh | null => {
  const haft = decor.model.haft;
  if (!haft) {
    return null;
  }
  const { x, z } = haft.position;
  const y = haft.position.y + haft.scale.y / 2 + 0.035;
  putBox(decor, [0.07, 0.06, 0.075], [x, y, z], BONE);
  for (const side of [-1, 1]) {
    putBox(decor, [0.006, 0.018, 0.018], [x + 0.034, y + 0.006, z + side * 0.017], HOLLOW);
  }
  putBox(decor, [0.006, 0.012, 0.01], [x + 0.034, y - 0.014, z], HOLLOW);
  return putBox(decor, [0.055, 0.018, 0.06], [x + 0.004, y - 0.04, z], BONE_DARK);
};

/**
 * The Bone Rattler's extras: vertebrae down the stock, bone charms
 * rattling under the prod, and the pommel skull's jaw chattering.
 * @param decor The repeating crossbow being decorated.
 * @param jaw The pommel skull's jaw.
 */
const rattler = (decor: VariantDecor, jaw: Mesh | null): void => {
  const haft = decor.model.haft;
  if (haft) {
    const top = haft.position.y + haft.scale.y / 2;
    for (let i = 0; i < 5; i++) {
      const y = top - 0.03 - i * 0.05;
      putBox(decor, [0.068, 0.022, 0.08], [haft.position.x, y, haft.position.z], BONE);
      putBox(decor, [0.035, 0.014, 0.02], [haft.position.x - 0.05, y, haft.position.z], BONE_DARK);
    }
  }
  const prod = findBox(decor, REPEATER_PROD);
  const charms: Group[] = [];
  if (prod) {
    [-0.19, 0.12, 0.21].forEach((z: number): void => {
      const charm = new Group();
      charm.position.set(prod.position.x, prod.position.y - prod.scale.y / 2, z);
      charm.add(
        decor.box([0.006, 0.04, 0.006], [0, -0.02, 0], SINEW),
        decor.box([0.018, 0.04, 0.018], [0, -0.055, 0], BONE),
        decor.box([0.03, 0.012, 0.03], [0, -0.078, 0], BONE_DARK),
      );
      decor.head.add(charm);
      charms.push(charm);
    });
  }
  const jawY = jaw?.position.y ?? 0;
  decor.animate((time: number): void => {
    charms.forEach((charm: Group, i: number): void => {
      charm.rotation.x = Math.sin(time * 9 + i * 1.3) * 0.5;
      charm.rotation.z = Math.cos(time * 7 + i) * 0.3;
    });
    if (jaw) {
      jaw.position.y = jawY - Math.abs(Math.sin(time * 12)) * 0.012;
    }
  });
};

/**
 * CrossBones' (the crossbow's) and Rattlebones' (the repeating
 * crossbow's) variants: silver bolts and fittings (Silver Bolter), a
 * vampire hunter's staked, cranked, sighted arbalest (Hunter's Arbalest),
 * a drum of singing bone pipes under a skull (Bone Choir), plus a spine,
 * rattling charms, and a chattering jaw (Bone Rattler).
 */
export const CROSSBOW_SHAPES: Partial<Record<VariantId, VariantShape>> = {
  'crossbow@holy1': silverBolter,
  'crossbow@holy2': huntersArbalest,
  'repeating-crossbow@fang1': (decor: VariantDecor): void => {
    boneDrum(decor);
    skullPommel(decor);
  },
  'repeating-crossbow@fang2': (decor: VariantDecor): void => {
    boneDrum(decor);
    rattler(decor, skullPommel(decor));
  },
};
