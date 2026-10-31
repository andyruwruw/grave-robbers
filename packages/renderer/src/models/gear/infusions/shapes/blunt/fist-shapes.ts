// Packages
import { Group } from 'three';

// Local Imports
import { BONE } from '../../../config/palette';
import {
  FLY,
  GRAVE_SOIL,
  PUS,
  ROSARY,
  SOUL,
  STITCH_DARK,
  TOMBSTONE,
} from '../../config/blunt-palette';
import {
  HOLY_HALO,
  HOLY_SILVER,
  HOLY_WING,
} from '../../config/essence-palette';
import { featherFan } from '../../helpers/feather-fan';

// Types
import type { Mesh } from 'three';
import type { VariantId, VariantShape } from '../../types/variant-shape';
import type { VariantDecor } from '../../variant-decor';

/**
 * The gauntlet's iron fist in its head: the middle's x and the front
 * face's x (the fist punches toward +x).
 * @param decor The model being decorated.
 * @returns The fist's middle and front.
 */
const fistOf = (decor: VariantDecor): { mid: number; front: number } => {
  const back = -decor.size[0] / 2;
  return { mid: back + 0.065, front: back + 0.13 };
};

/**
 * Holy Gauntlets: a rosary wound round the cuff with a silver cross
 * swinging from it, and the cross on the back of the hand blazing while
 * the fists are charged.
 * @param decor The model being decorated.
 */
const holyGauntlets = (decor: VariantDecor): void => {
  for (let i = 0; i < 10; i++) {
    const turn = (i / 10) * Math.PI * 2;
    decor.addToModel(decor.box([0.018, 0.018, 0.018], [Math.cos(turn) * 0.064, 0.1 + (i % 2) * 0.006, Math.sin(turn) * 0.064], ROSARY));
  }
  const cross = new Group();
  cross.position.set(0.03, 0.095, 0.06);
  cross.add(
    decor.box([0.006, 0.04, 0.006], [0, -0.02, 0], ROSARY),
    decor.box([0.012, 0.042, 0.006], [0, -0.058, 0], HOLY_SILVER),
    decor.box([0.03, 0.01, 0.006], [0, -0.05, 0], HOLY_SILVER),
  );
  decor.addToModel(cross);
  const tall = Math.min(decor.length, 0.16) * 0.8;
  const wide = Math.min(decor.width, 0.12) * 0.8;
  const t = decor.depth / 2 + 0.012;
  const sigil = [
    decor.add(decor.vec(tall + 0.008, 0.03, 0.006), decor.vec(0, 0, t), HOLY_HALO, true),
    decor.add(decor.vec(0.03, wide + 0.008, 0.006), decor.vec(decor.gripSide * tall * 0.2, 0, t), HOLY_HALO, true),
  ];
  decor.animate((time, _dt, holder): void => {
    cross.rotation.z = Math.sin(time * 2.1) * 0.3;
    cross.rotation.x = Math.sin(time * 1.6) * 0.2;
    const charge = holder?.charge ?? 0;
    for (const bar of sigil) {
      bar.visible = charge > 0;
    }
  });
};

/**
 * Archangel's Fists: white wings sweeping back from the cuff, glowing
 * studs across the knuckles, and a ring of holy light swelling out from
 * the fist now and then, like the nova.
 * @param decor The model being decorated.
 */
const archangelsFists = (decor: VariantDecor): void => {
  for (const side of [-1, 1]) {
    const wing = featherFan(decor.box, 4, 0.12, HOLY_WING);
    wing.position.set(-0.01, 0.06, side * 0.058);
    wing.rotation.y = -side * Math.PI / 2;
    decor.addToModel(wing);
  }
  const { mid, front } = fistOf(decor);
  for (const z of [-0.045, -0.015, 0.015, 0.045]) {
    decor.add([0.012, 0.018, 0.018], [front + 0.006, 0.03, z], HOLY_HALO, true);
  }
  const ring = new Group();
  ring.position.x = mid;
  for (let i = 0; i < 10; i++) {
    const turn = (i / 10) * Math.PI * 2;
    const seg = decor.box([0.012, 0.012, 0.06], [0, Math.cos(turn) * 0.1, Math.sin(turn) * 0.1], HOLY_HALO, true);
    seg.rotation.x = turn;
    ring.add(seg);
  }
  decor.head.add(ring);
  decor.animate((time: number): void => {
    const k = (time * 0.5) % 1;
    ring.visible = k < 0.5;
    ring.scale.setScalar(0.6 + k * 1.6);
  });
};

/**
 * Plague Knuckles: sickly glowing boils on the fist and cuff, green ooze
 * dripping off the blades, and flies buzzing round.
 * @param decor The model being decorated.
 */
const plagueKnuckles = (decor: VariantDecor): void => {
  const { mid, front } = fistOf(decor);
  const boils: [number, number, number, number][] = [[mid - 0.035, 0.052, 0.03, 0.022], [mid + 0.02, 0.052, -0.035, 0.018], [mid - 0.01, -0.01, 0.067, 0.02]];
  for (const [x, y, z, s] of boils) {
    decor.add([s, s, s], [x, y, z], PUS, true);
  }
  decor.addToModel(decor.box([0.02, 0.02, 0.02], [0.056, 0.09, 0.02], PUS, true));
  decor.addToModel(decor.box([0.018, 0.018, 0.018], [-0.02, 0.05, -0.056], PUS, true));
  const drip = decor.add([0.014, 0.02, 0.014], [front + 0.04, -0.03, 0], PUS, true, 0.8);
  const flies: Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    flies.push(decor.add([0.014, 0.01, 0.014], [0, 0, 0], FLY));
  }
  decor.animate((time: number): void => {
    const k = (time * 0.6) % 1;
    drip.scale.y = 0.01 + k * 0.04;
    drip.position.y = -0.025 - drip.scale.y / 2 - (k > 0.85 ? (k - 0.85) * 0.5 : 0);
    for (let i = 0; i < flies.length; i++) {
      const turn = time * (3 + i * 0.7) + i * 2.1;
      flies[i].position.set(mid + Math.cos(turn) * 0.11, 0.05 + Math.sin(time * 7 + i * 3) * 0.04, Math.sin(turn * 1.3) * 0.11);
    }
  });
};

/**
 * Grave Fists: bone knuckles and a skeletal hand over the fist, grave
 * soil caked on it, a little tombstone on the cuff, and pale souls rising
 * off it.
 * @param decor The model being decorated.
 */
const graveFists = (decor: VariantDecor): void => {
  const { mid, front } = fistOf(decor);
  for (const z of [-0.045, -0.015, 0.015, 0.045]) {
    decor.add([0.024, 0.03, 0.024], [front + 0.01, 0.025, z], BONE);
    decor.add([0.045, 0.01, 0.012], [mid - 0.03, 0.055, z], BONE);
  }
  decor.add([0.03, 0.02, 0.03], [mid - 0.04, -0.055, 0.03], GRAVE_SOIL);
  decor.add([0.026, 0.018, 0.034], [mid + 0.03, -0.055, -0.04], GRAVE_SOIL);
  decor.addToModel(decor.box([0.055, 0.06, 0.012], [0, 0.085, 0.062], TOMBSTONE));
  decor.addToModel(decor.box([0.04, 0.016, 0.012], [0, 0.12, 0.062], TOMBSTONE));
  decor.addToModel(decor.box([0.008, 0.035, 0.004], [0, 0.088, 0.069], STITCH_DARK));
  decor.addToModel(decor.box([0.026, 0.008, 0.004], [0, 0.096, 0.069], STITCH_DARK));
  const souls: Mesh[] = [];
  for (let i = 0; i < 2; i++) {
    const soul = decor.box([0.03, 0.04, 0.03], [0, 0, 0], SOUL, true, 0.55);
    decor.addToModel(soul);
    souls.push(soul);
  }
  const { x, y, z } = decor.rest;
  decor.animate((time: number): void => {
    for (let i = 0; i < souls.length; i++) {
      const k = (time * 0.4 + i * 0.5) % 1;
      souls[i].position.set(x + Math.sin(k * 6 + i * 3) * 0.03, y + 0.05 + k * 0.2, z + (i ? 0.03 : -0.03));
      souls[i].scale.set(0.03 * (1 - k * 0.6), 0.04 * (1 - k * 0.3), 0.03 * (1 - k * 0.6));
    }
  });
};

/**
 * The spiked gauntlet's own twists, by variant.
 */
export const FIST_SHAPES: Partial<Record<VariantId, VariantShape>> = {
  'spiked-gauntlet@holy1': holyGauntlets,
  'spiked-gauntlet@holy2': archangelsFists,
  'spiked-gauntlet@hex1': plagueKnuckles,
  'spiked-gauntlet@hex2': graveFists,
};
