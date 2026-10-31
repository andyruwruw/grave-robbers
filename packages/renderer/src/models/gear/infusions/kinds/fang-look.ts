// Local Imports
import { EDGE } from '../../config/palette';
import { FANG, GUM, SINEW } from '../config/essence-palette';
import { EssenceLook } from '../essence-look';

// Types
import type { InfusionLevel } from '@halloween/shared/gear/types/infusion';
import type { ColorRemap } from '../types/variant-shape';
import type { VariantDecor } from '../variant-decor';

/**
 * Ghoul fang (Feral): level 1 fangs set along the edge and sinew lashed
 * round the haft and head; level 2 a serrated, jaw-shaped head, longer
 * and leaner, toothed on both sides.
 */
export class FangLook extends EssenceLook {
  /**
   * At level 2 the edge turns to bone.
   * @param level The infusion's level.
   * @returns The color remap.
   */
  remap(level: InfusionLevel): ColorRemap {
    return level === 2 ? { [EDGE]: { color: FANG } } : {};
  }

  /**
   * Fangs and sinew; at level 2 a long jaw toothed on both sides.
   * @param decor The model being decorated.
   * @param level The infusion's level.
   */
  decorate(decor: VariantDecor, level: InfusionLevel): void {
    const count = this.fit(decor, level === 2 ? 0.05 : 0.07, 2, level === 2 ? 8 : 6);
    this._fangs(decor, count, 1);
    if (level === 2) {
      this._fangs(decor, count - 1, -1);
      for (const side of [-1, 1]) {
        decor.add(decor.vec(decor.length * 0.85, 0.022, decor.depth + 0.012), decor.vec(0, side * (decor.width / 2 + 0.004), 0), GUM);
      }
      decor.head.scale.setComponent(decor.along, 1.3);
      decor.head.scale.setComponent(decor.out, 0.8);
    }
    decor.wrap(0.82, 0.035, SINEW);
    decor.wrap(0.94, 0.03, SINEW);
    decor.add(decor.vec(0.03, decor.width + 0.02, decor.depth + 0.02), decor.vec(decor.gripSide * decor.length * 0.38, 0, 0), SINEW);
  }

  /**
   * A row of fangs along one side of the head, each a root and a point.
   * @param decor The model being decorated.
   * @param count How many.
   * @param side Which side: 1 the edge, -1 the back.
   */
  private _fangs(decor: VariantDecor, count: number, side: number): void {
    const o = side * decor.width / 2;
    for (const a of decor.spread(count)) {
      decor.add(decor.vec(0.03, 0.035, 0.022), decor.vec(a, o + side * 0.012, 0), FANG);
      decor.add(decor.vec(0.016, 0.03, 0.014), decor.vec(a, o + side * 0.04, 0), FANG);
    }
  }
}
