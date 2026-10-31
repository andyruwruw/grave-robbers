// Local Imports
import { FLAME_CORE } from '../../config/palette';
import {
  ECTO,
  ECTO_PALE,
  LAVA,
  LAVA_HOT,
  OBSIDIAN,
} from '../config/essence-palette';
import { EMBER } from '../config/ranged-palette';
import {
  boxEnd,
  findBox,
  findBoxes,
  flicker,
  putBox,
  swapBox,
} from '../helpers/model-boxes';

// Types
import type { Mesh } from 'three';
import type { VariantId, VariantShape } from '../types/variant-shape';
import type { VariantDecor } from '../variant-decor';

/**
 * The nocked arrow's shaft.
 */
const ARROW: [number, number, number] = [0.02, 0.38, 0.02];

/**
 * The bowstring.
 */
const STRING: [number, number, number] = [0.01, 0.01, 0.56];

/**
 * One bent limb.
 */
const LIMB: [number, number, number] = [0.035, 0.035, 0.3];

/**
 * How many pieces the Wraithstring's rippling string is cut into.
 */
const WRAITH_SEGMENTS = 8;

/**
 * Each limb's outer tip, in the head's space, with the side it's on.
 * @param decor The bow being decorated.
 * @returns Each tip and its side (1 or -1 along z).
 */
const limbTips = (decor: VariantDecor): { x: number; y: number; z: number; side: number }[] => findBoxes([decor.head], LIMB).map((limb: Mesh) => {
  const side = Math.sign(limb.position.z) || 1;
  const end = boxEnd(limb, 2, side);
  return { x: end.x, y: end.y, z: end.z, side };
});

/**
 * A spirit arrow: a see-through glowing shaft, ghostly fletching, a
 * glowing head, and a wisp circling it.
 * @param decor The bow being decorated.
 */
const spiritArrow = (decor: VariantDecor): void => {
  const arrow = findBox(decor, ARROW);
  if (arrow) {
    const shaft = swapBox(decor, arrow, { color: ECTO_PALE, glow: true, opacity: 0.55 });
    const nock = shaft.position.y + shaft.scale.y / 2 - 0.04;
    putBox(decor, [0.006, 0.07, 0.034], [shaft.position.x, nock, shaft.position.z], ECTO, true, 0.5);
    putBox(decor, [0.034, 0.07, 0.006], [shaft.position.x, nock, shaft.position.z], ECTO, true, 0.5);
  }
  const tip = decor.model.tip;
  if (!tip) {
    return;
  }
  const head = swapBox(decor, tip, { color: ECTO, glow: true, opacity: 0.85 });
  const { x, y, z } = head.position;
  const wisp = putBox(decor, [0.018, 0.018, 0.018], [x, y, z], ECTO_PALE, true, 0.7);
  decor.animate((time: number): void => {
    const turn = time * 5;
    wisp.position.set(x + Math.cos(turn) * 0.035, y + 0.02 + Math.sin(time * 2.5) * 0.02, z + Math.sin(turn) * 0.035);
  });
};

/**
 * The Wraithstring's string: the plain one swapped for a rippling ghostly
 * strand that floats with the limbs, and wisps trailing off the limb tips.
 * @param decor The bow being decorated.
 */
const wraithString = (decor: VariantDecor): void => {
  const string = findBox(decor, STRING);
  if (!string) {
    return;
  }
  string.visible = false;
  const y = string.position.y - decor.rest.y;
  const span = string.scale.z;
  const step = span / WRAITH_SEGMENTS;
  const pieces: Mesh[] = [];
  for (let i = 0; i < WRAITH_SEGMENTS; i++) {
    pieces.push(decor.add([0.012, 0.012, step * 1.05], [0, y, -span / 2 + step * (i + 0.5)], ECTO_PALE, true, 0.6));
  }
  const tails: { mesh: Mesh; x: number; k: number }[] = [];
  for (const tip of limbTips(decor)) {
    for (let k = 0; k < 3; k++) {
      const mesh = decor.add([0.03 - k * 0.006, 0.03 - k * 0.006, 0.03 - k * 0.006], [tip.x, tip.y + 0.03 * (k + 1), tip.z + tip.side * 0.012 * k], ECTO_PALE, true, 0.4);
      tails.push({ mesh, x: tip.x, k: k + tip.side * 2 });
    }
  }
  decor.animate((time: number): void => {
    for (let i = 0; i < pieces.length; i++) {
      const env = Math.sin((Math.PI * (i + 0.5)) / WRAITH_SEGMENTS);
      pieces[i].position.x = Math.sin(time * 7 + i * 0.8) * 0.016 * env;
      pieces[i].position.y = y + Math.cos(time * 5 + i * 0.6) * 0.01 * env;
    }
    for (const { mesh, x, k } of tails) {
      mesh.position.x = x + Math.sin(time * 3 + k) * 0.015;
    }
  });
};

/**
 * A burning arrowhead, a smoldering string, and obsidian horns on the
 * limb tips.
 * @param decor The bow being decorated.
 */
const flameArrow = (decor: VariantDecor): void => {
  const string = findBox(decor, STRING);
  if (string) {
    swapBox(decor, string, { color: EMBER, glow: true });
  }
  const tip = decor.model.tip;
  if (tip) {
    const { x, y, z } = tip.position;
    flicker(decor, putBox(decor, [0.05, 0.08, 0.05], [x, y + 0.015, z], LAVA_HOT, true, 0.85), 0);
    putBox(decor, [0.026, 0.04, 0.026], [x, y + 0.005, z], FLAME_CORE, true);
  }
  for (const tip of limbTips(decor)) {
    const horn = decor.add([0.024, 0.06, 0.024], [tip.x, tip.y + 0.02, tip.z], OBSIDIAN);
    horn.rotation.x = tip.side * 0.6;
  }
};

/**
 * The Pyre Bow's extras: a flame burning on each limb tip, and burning
 * drops trailing back off the arrowhead.
 * @param decor The bow being decorated.
 */
const pyre = (decor: VariantDecor): void => {
  limbTips(decor).forEach((tip, i: number): void => {
    flicker(decor, decor.add([0.04, 0.07, 0.04], [tip.x, tip.y + 0.06, tip.z + tip.side * 0.015], LAVA_HOT, true, 0.85), i * 2.1, 0.25);
    decor.add([0.02, 0.035, 0.02], [tip.x, tip.y + 0.045, tip.z + tip.side * 0.015], FLAME_CORE, true);
  });
  const tip = decor.model.tip;
  if (!tip) {
    return;
  }
  const { x, y, z } = tip.position;
  const drops = [0, 1, 2].map((): Mesh => putBox(decor, [0.022, 0.022, 0.022], [x, y, z], LAVA, true));
  decor.animate((time: number): void => {
    drops.forEach((drop: Mesh, i: number): void => {
      const k = (time * 1.4 + i / drops.length) % 1;
      drop.position.set(x + Math.sin(i * 2.3) * 0.02 * k, y + 0.04 + k * 0.2, z + Math.cos(i * 1.9) * 0.02 * k);
      drop.scale.setScalar(0.024 * (1 - k * 0.8));
    });
  });
};

/**
 * The bow's variants: a ghostly arrow (Spirit Bow), plus a rippling wraith
 * string (Wraithstring), a burning arrow (Flame Bow), plus burning limb
 * tips and a trail of fire drops (Pyre Bow).
 */
export const BOW_SHAPES: Partial<Record<VariantId, VariantShape>> = {
  'bow@ecto1': spiritArrow,
  'bow@ecto2': (decor: VariantDecor): void => {
    spiritArrow(decor);
    wraithString(decor);
  },
  'bow@brimstone1': flameArrow,
  'bow@brimstone2': (decor: VariantDecor): void => {
    flameArrow(decor);
    pyre(decor);
  },
};
