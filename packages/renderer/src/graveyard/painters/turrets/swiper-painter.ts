// Packages
import { Euler } from 'three';

// Local Imports
import { pick } from '../../../helpers/pick';
import { STONE } from '../../config/palette/ground';
import { BLADE } from '../../config/palette/props';
import { BONE, FORGE_IRON, IRON, PLANK } from '../../config/palette/structures';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * A swiper: four blades on a spinning hub, topped with a skull.
 */
export class SwiperPainter extends TilePainter {
  /**
   * Paints the swiper.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, rand, x, z, base } = p;
    lit.add([x, base + 0.08, z], [0.6, 0.16, 0.6], pick(rand, STONE));
    lit.add([x, base + 0.35, z], [0.12, 0.42, 0.12], IRON);
    lit.add([x, base + 0.58, z], [0.22, 0.1, 0.22], FORGE_IRON);
    const spin = rand() * Math.PI;
    for (let i = 0; i < 4; i++) {
      const a = spin + (i / 4) * Math.PI * 2;
      const at = this.turned(x, z, base, a);
      lit.add(at(0, 0.58, 0.2), [0.06, 0.05, 0.2], pick(rand, PLANK), new Euler(0, a, 0));
      lit.add(at(0, 0.58, 0.48), [0.05, 0.12, 0.38], pick(rand, BLADE), new Euler(0, a, 0));
      lit.add(at(0, 0.58, 0.68), [0.03, 0.08, 0.04], BLADE[0], new Euler(0, a, 0));
      lit.add(at(0, 0.58, 0.3), [0.14, 0.05, 0.03], IRON, new Euler(0, a, 0));
    }
    this.skull(lit, this.turned(x, z, base, 0), new Euler(0, 0, 0), 0, 0.72, 0, 0.14, pick(rand, BONE));
  }
}
