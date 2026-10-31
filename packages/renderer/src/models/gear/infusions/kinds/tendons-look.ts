// Local Imports
import {
  IRON_BAND,
  KNUCKLE,
  TENDON,
  TENDON_DARK,
} from '../config/essence-palette';
import { EssenceLook } from '../essence-look';

// Types
import type { InfusionLevel } from '@halloween/shared/gear/types/infusion';
import type { ColorRemap } from '../types/variant-shape';
import type { VariantDecor } from '../variant-decor';

/**
 * Brute tendons (Hulking): level 1 a thicker head bound in raw tendon and
 * black iron bands; level 2 an oversized head studded with grafted bone
 * knuckles.
 */
export class TendonsLook extends EssenceLook {
  /**
   * Tendons keep the weapon's own colors.
   * @returns The color remap.
   */
  remap(): ColorRemap {
    return {};
  }

  /**
   * Bands and a thicker head; at level 2 a bigger head and knuckles.
   * @param decor The model being decorated.
   * @param level The infusion's level.
   */
  decorate(decor: VariantDecor, level: InfusionLevel): void {
    /**
     * Binds a band round the head.
     * @param a Where along the edge.
     * @param grow How much bigger than the head it is.
     * @param height How wide the band is.
     * @param color Its color.
     */
    const ring = (a: number, grow: number, height: number, color: string): void => {
      decor.add(decor.vec(height, decor.width + grow, decor.depth + grow), decor.vec(a, 0, 0), color);
    };
    ring(-decor.length * 0.18, 0.02, 0.04, TENDON);
    ring(decor.length * 0.18, 0.02, 0.035, TENDON_DARK);
    ring(-decor.length * 0.38, 0.026, 0.025, IRON_BAND);
    ring(decor.length * 0.38, 0.026, 0.025, IRON_BAND);
    decor.wrap(0.9, 0.05, TENDON);
    if (level === 2) {
      this._knuckles(decor);
      decor.head.scale.set(1.45, 1.45, 1.45);
      decor.head.scale.setComponent(decor.thick, 1.6);
    } else {
      decor.head.scale.setComponent(decor.out, 1.2);
      decor.head.scale.setComponent(decor.thick, 1.35);
    }
  }

  /**
   * Bone knuckles along the edge's back and on both faces.
   * @param decor The model being decorated.
   */
  private _knuckles(decor: VariantDecor): void {
    for (const a of decor.spread(3, 0.2)) {
      decor.add(decor.vec(0.04, 0.035, 0.04), decor.vec(a, -decor.width / 2 - 0.012, 0), KNUCKLE);
    }
    for (const side of [-1, 1]) {
      for (const a of decor.spread(2, 0.25)) {
        decor.add(decor.vec(0.035, 0.035, 0.03), decor.vec(a, 0, side * (decor.depth / 2 + 0.012)), KNUCKLE);
      }
    }
  }
}
