// Local Imports
import { BAND, SHIELD_WOOD } from '../../config/palette';
import { MIRROR, MIRROR_GLINT, MIRROR_RIM } from '../config/essence-palette';
import { EssenceLook } from '../essence-look';

// Types
import type { ColorRemap } from '../types/variant-shape';
import type { VariantDecor } from '../variant-decor';

/**
 * Silver (the Mirror Shield): the boards and bands turn to silver and a
 * polished mirror covers the face, framed in a rim, with a glint that
 * sweeps across it now and then.
 */
export class SilverLook extends EssenceLook {
  /**
   * Boards and bands to silver.
   * @returns The color remap.
   */
  remap(): ColorRemap {
    return { [SHIELD_WOOD]: { color: MIRROR_RIM }, [BAND]: { color: MIRROR_RIM } };
  }

  /**
   * The mirror face, its rim, and the sweeping glint.
   * @param decor The model being decorated.
   */
  decorate(decor: VariantDecor): void {
    const t = decor.depth / 2 + 0.004;
    const long = decor.length * 0.84;
    const wide = decor.width * 0.84;
    decor.add(decor.vec(long, wide, 0.008), decor.vec(0, 0, t), MIRROR);
    for (const side of [-1, 1]) {
      decor.add(decor.vec(0.025, wide + 0.025, 0.014), decor.vec(side * long / 2, 0, t), MIRROR_RIM);
      decor.add(decor.vec(long + 0.025, 0.025, 0.014), decor.vec(0, side * wide / 2, t), MIRROR_RIM);
    }
    const glint = decor.add(decor.vec(0.014, wide * 0.6, 0.004), decor.vec(0, 0, t + 0.006), MIRROR_GLINT, true, 0.7);
    this.tilt(decor, glint, 0.6);
    decor.animate((time: number): void => {
      const k = (time * 0.35) % 1;
      glint.visible = k < 0.4;
      decor.place(glint, (k / 0.4 - 0.5) * long * 0.8, 0, t + 0.006);
    });
  }
}
