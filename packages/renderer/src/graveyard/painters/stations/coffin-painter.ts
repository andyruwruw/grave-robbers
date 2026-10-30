// Packages
import { Euler } from 'three';

// Local Imports
import { pick } from '../../../helpers/pick';
import { DIRT } from '../../config/palette/ground';
import { COFFIN_WOOD } from '../../config/palette/props';
import { BONE, IRON } from '../../config/palette/structures';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * A coffin on a dirt plot, turned a little, with a bone cross and a candle.
 */
export class CoffinPainter extends TilePainter {
  /**
   * Paints the coffin.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, glow, rand, x, z, base } = p;
    const yaw = (rand() - 0.5) * 0.3;
    const at = this.turned(x, z, base, yaw);
    const turn = new Euler(0, yaw, 0);
    lit.add(at(0, 0.01, 0.02), [0.62, 0.02, 0.98], pick(rand, DIRT), turn);
    /**
     * The coffin's width at a point along it, widest at the shoulders.
     * @param dz Offset along the coffin.
     * @returns The width.
     */
    const width = (dz: number): number => (dz < -0.2 ? 0.3 + (dz + 0.44) / 0.24 * 0.22 : 0.52 - (dz + 0.2) / 0.64 * 0.24);
    for (let i = 0; i < 10; i++) {
      const dz = -0.44 + (i + 0.5) * 0.088;
      const w = width(dz);
      lit.add(at(0, 0.13, dz), [w, 0.22, 0.09], COFFIN_WOOD[0], turn);
      lit.add(at(0, 0.255, dz), [w - 0.07, 0.04, 0.09], COFFIN_WOOD[1], turn);
    }
    lit.add(at(0, 0.29, 0.03), [0.06, 0.03, 0.46], BONE[0], turn);
    lit.add(at(0, 0.29, -0.1), [0.26, 0.03, 0.06], BONE[0], turn);
    for (const dz of [-0.04, 0.22]) {
      for (const side of [-1, 1]) {
        lit.add(at(side * (width(dz) / 2 + 0.02), 0.13, dz), [0.03, 0.04, 0.12], IRON, turn);
      }
    }
    this.candle(lit, glow, at(-0.26, 0, -0.42), 0.12);
  }
}
