// Packages
import { Euler } from 'three';

// Local Imports
import { pick } from '../../../helpers/pick';
import { BLOODSTEEL, BLOOD_POOL, BLOOD_STAIN, FORGE_FLOOR } from '../../config/palette/props';
import { BONE, FORGE_IRON, FORGE_STONE } from '../../config/palette/structures';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * A bloodforge: dark stone, bloodsteel fittings, a skull, a chimney, and a
 * crucible of blood.
 */
export class BloodforgePainter extends TilePainter {
  /**
   * Paints the bloodforge.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, glow, rand, x, z, base } = p;
    /**
     * Picks a forge stone color.
     * @returns The color.
     */
    const stone = (): string => pick(rand, FORGE_STONE);
    lit.add([x, base + 0.06, z], [0.9, 0.12, 0.84], stone());
    for (const side of [-1, 1]) {
      for (let row = 0; row < 3; row++) {
        lit.add([x + side * 0.25, base + 0.22 + row * 0.2, z - 0.04], [0.2, 0.19, 0.66 - rand() * 0.04], stone());
      }
      lit.add([x + side * 0.36, base + 0.45, z + 0.29], [0.05, 0.66, 0.05], FORGE_IRON);
    }
    lit.add([x, base + 0.42, z - 0.3], [0.32, 0.6, 0.16], stone());
    lit.add([x, base + 0.13, z + 0.02], [0.3, 0.03, 0.5], FORGE_FLOOR);
    lit.add([x, base + 0.6, z - 0.04], [0.34, 0.24, 0.62], stone());
    lit.add([x, base + 0.52, z + 0.29], [0.36, 0.08, 0.06], pick(rand, BLOODSTEEL));
    lit.add([x, base + 0.8, z - 0.04], [0.78, 0.18, 0.7], stone());
    lit.add([x, base + 0.74, z + 0.31], [0.8, 0.04, 0.03], FORGE_IRON);
    this.skull(lit, this.turned(x, z, base, 0), new Euler(), 0, 0.82, 0.3, 0.14, BONE[1]);
    lit.add([x, base + 0.95, z - 0.06], [0.52, 0.12, 0.5], stone());
    for (const [cx, cz] of [[-0.33, 0.25], [0.33, 0.25], [-0.33, -0.33], [0.33, -0.33]]) {
      lit.add([x + cx, base + 0.93, z + cz], [0.07, 0.08, 0.07], FORGE_IRON);
      lit.add([x + cx, base + 1.0, z + cz], [0.04, 0.08, 0.04], pick(rand, BLOODSTEEL));
    }
    lit.add([x - 0.12, base + 1.22, z - 0.18], [0.2, 0.42, 0.2], FORGE_IRON);
    lit.add([x - 0.12, base + 1.45, z - 0.18], [0.26, 0.05, 0.26], pick(rand, BLOODSTEEL));
    lit.add([x - 0.12, base + 1.1, z - 0.07], [0.22, 0.03, 0.01], BLOODSTEEL[0]);
    const cx = x + 0.3;
    const cz = z + 0.32;
    lit.add([cx, base + 0.2, cz], [0.24, 0.16, 0.22], FORGE_IRON);
    lit.add([cx, base + 0.29, cz], [0.28, 0.04, 0.26], FORGE_IRON);
    glow.add([cx, base + 0.305, cz], [0.2, 0.01, 0.18], BLOOD_POOL);
    for (const side of [-1, 1]) {
      lit.add([cx + side * 0.15, base + 0.16, cz], [0.03, 0.08, 0.03], FORGE_IRON);
    }
    lit.add([cx - 0.04, base + 0.311, cz + 0.135], [0.04, 0.03, 0.02], BLOOD_STAIN[1]);
    lit.add([x - 0.3, base + 0.145, z + 0.32], [0.08, 0.05, 0.18], BLOODSTEEL[1]);
    lit.add([x - 0.21, base + 0.145, z + 0.32], [0.08, 0.05, 0.18], BLOODSTEEL[0]);
    lit.add([x - 0.255, base + 0.195, z + 0.32], [0.08, 0.05, 0.18], BLOODSTEEL[2]);
  }
}
