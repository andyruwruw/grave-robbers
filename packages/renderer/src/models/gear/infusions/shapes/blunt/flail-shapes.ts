// Packages
import { Vector3 } from 'three';

// Local Imports
import {
  INCENSE_EMBER,
  INCENSE_SMOKE,
  JUDGMENT_SMOKE,
  SMOKE_OPACITY,
} from '../../config/blunt-palette';
import {
  HOLY_GOLD,
  HOLY_GOLD_DARK,
  HOLY_HALO,
  HOLY_SILVER,
} from '../../config/essence-palette';

// Types
import type { Mesh } from 'three';
import type { VariantId, VariantShape } from '../../types/variant-shape';
import type { VariantDecor } from '../../variant-decor';

/**
 * How a censer looks.
 */
interface CenserStyle {
  /**
   * The lid's and rim's metal.
   */
  metal: string;

  /**
   * The lid's darker top.
   */
  dome: string;

  /**
   * The glow through the vents.
   */
  ember: string;

  /**
   * Rows of vents round the bowl.
   */
  rows: number;

  /**
   * The smoke's color.
   */
  smoke: string;

  /**
   * How many puffs of smoke rise at once.
   */
  puffs: number;
}

/**
 * Turns the flail's ball into a censer: a rim and a domed lid on top,
 * glowing vents between the spikes, and incense smoke curling up off it.
 * @param decor The model being decorated.
 * @param style How it looks.
 * @returns The ball's middle, in the head.
 */
const censer = (decor: VariantDecor, style: CenserStyle): Vector3 => {
  const b = decor.model.tip?.position.clone() ?? new Vector3();
  const r = (decor.model.tip?.scale.x ?? 0.14) / 2;
  decor.add([r * 2 + 0.02, 0.022, r * 2 + 0.02], [b.x, b.y + r * 0.5, b.z], style.metal);
  decor.add([r * 2 - 0.01, 0.03, r * 2 - 0.01], [b.x, b.y + r + 0.005, b.z], style.metal);
  decor.add([r * 1.1, 0.03, r * 1.1], [b.x, b.y + r + 0.03, b.z], style.dome);
  for (let row = 0; row < style.rows; row++) {
    const y = b.y + (style.rows === 1 ? 0 : -0.035 + row * 0.07);
    for (const side of [-1, 1]) {
      for (const slot of [-1, 1]) {
        decor.add([0.006, 0.026, 0.014], [b.x + side * (r + 0.002), y, b.z + slot * r * 0.62], style.ember, true);
        decor.add([0.014, 0.026, 0.006], [b.x + slot * r * 0.62, y, b.z + side * (r + 0.002)], style.ember, true);
      }
    }
  }
  const puffs: Mesh[] = [];
  for (let i = 0; i < style.puffs; i++) {
    puffs.push(decor.add([0.03, 0.03, 0.03], [b.x, b.y, b.z], style.smoke, false, SMOKE_OPACITY));
  }
  const from = b.y + r + 0.05;
  decor.animate((time: number): void => {
    for (let i = 0; i < puffs.length; i++) {
      const k = (time * 0.45 + i / puffs.length) % 1;
      const puff = puffs[i];
      puff.position.set(b.x + Math.sin(k * 5 + i * 2.3) * 0.035 + k * 0.05, from + k * 0.3, b.z + Math.cos(k * 4 + i) * 0.03);
      puff.scale.setScalar(0.02 + k * 0.05 * (1 - k * 0.4));
      puff.rotation.y = k * 2 + i;
    }
  });
  return b;
};

/**
 * Censer Flail: the ball a silver censer breathing incense.
 * @param decor The model being decorated.
 */
const censerFlail = (decor: VariantDecor): void => {
  censer(decor, { metal: HOLY_SILVER, dome: HOLY_SILVER, ember: INCENSE_EMBER, rows: 1, smoke: INCENSE_SMOKE, puffs: 4 });
};

/**
 * Thurible of Judgment: a gold censer with two rows of vents, a crown of
 * points round its lid, and thicker golden smoke.
 * @param decor The model being decorated.
 */
const thuribleOfJudgment = (decor: VariantDecor): void => {
  const b = censer(decor, { metal: HOLY_GOLD, dome: HOLY_GOLD_DARK, ember: HOLY_HALO, rows: 2, smoke: JUDGMENT_SMOKE, puffs: 6 });
  const r = (decor.model.tip?.scale.x ?? 0.14) / 2;
  for (const x of [-1, 1]) {
    for (const z of [-1, 1]) {
      const point = decor.add([0.022, 0.045, 0.022], [b.x + x * (r - 0.01), b.y + r + 0.04, b.z + z * (r - 0.01)], HOLY_GOLD);
      point.rotation.y = Math.PI / 4;
    }
  }
  decor.add([r * 2 + 0.03, 0.016, r * 2 + 0.03], [b.x, b.y - r * 0.55, b.z], HOLY_GOLD_DARK);
};

/**
 * The flail's own twists, by variant.
 */
export const FLAIL_SHAPES: Partial<Record<VariantId, VariantShape>> = {
  'flail@holy1': censerFlail,
  'flail@holy2': thuribleOfJudgment,
};
