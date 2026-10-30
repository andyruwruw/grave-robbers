// Packages
import { Euler } from 'three';

// Local Imports
import { pick } from '../../../helpers/pick';
import { ALTAR_TROUGH, BLOOD_POOL, BLOOD_STAIN } from '../../config/palette/props';
import { ALTAR_STONE, BONE } from '../../config/palette/structures';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint, Vec } from '../../../types/terrain';

/**
 * A blood altar covered in skulls, bones, candles and stains, with the trough
 * `AltarGauges` fills.
 */
export class AltarPainter extends TilePainter {
  /**
   * Paints the altar.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, glow, rand, x, z, base } = p;
    const at = this.turned(x, z, base, 0);
    const none = new Euler();
    /**
     * Picks an altar stone color.
     * @returns The color.
     */
    const stone = (): string => pick(rand, ALTAR_STONE);
    lit.add([x, base + 0.05, z], [0.96, 0.1, 0.86], stone());
    lit.add([x, base + 0.14, z], [0.86, 0.08, 0.74], stone());
    lit.add([x, base + 0.36, z], [0.68, 0.36, 0.52], stone());
    for (const side of [-1, 1]) {
      lit.add([x + side * 0.33, base + 0.36, z + 0.24], [0.13, 0.36, 0.13], stone());
      lit.add([x + side * 0.33, base + 0.36, z - 0.24], [0.13, 0.36, 0.13], stone());
    }
    lit.add([x, base + 0.59, z], [0.92, 0.1, 0.7], stone());
    lit.add([x, base + 0.645, z], [0.84, 0.02, 0.62], ALTAR_STONE[2]);
    this.skull(lit, at, none, 0, 0.4, 0.22, 0.16, BONE[1]);
    for (const side of [-1, 1]) {
      this.bone(lit, at(side * 0.06, 0.28, 0.27), at(side * 0.2, 0.42, 0.27), 0.03, BONE[3]);
    }
    const top = base + 0.655;
    lit.add([x, top + 0.004, z + 0.265], [0.68, 0.012, 0.15], ALTAR_TROUGH);
    lit.add([x, top + 0.04, z - 0.06], [0.32, 0.08, 0.28], ALTAR_STONE[1]);
    glow.add([x, top + 0.085, z - 0.06], [0.24, 0.012, 0.2], BLOOD_POOL);
    for (let i = 0; i < 3; i++) {
      lit.add([x + (rand() - 0.5) * 0.6, top + 0.004, z + 0.1 + (rand() - 0.5) * 0.3], [0.08 + rand() * 0.14, 0.008, 0.06 + rand() * 0.1], pick(rand, BLOOD_STAIN), new Euler(0, rand() * Math.PI, 0));
    }
    for (let i = 0; i < 3; i++) {
      const dx = (i - 1) * 0.2 + (rand() - 0.5) * 0.1;
      const h = 0.1 + rand() * 0.2;
      const stain = pick(rand, BLOOD_STAIN);
      lit.add([x + dx, base + 0.6, z + 0.356], [0.045, 0.1, 0.012], stain);
      lit.add([x + dx, base + 0.54 - h / 2, z + 0.266], [0.035, h, 0.012], stain);
    }
    lit.add([x + 0.1, base + 0.185, z + 0.32], [0.18, 0.01, 0.1], BLOOD_STAIN[0]);
    for (const [cx, cz, h] of [[-0.38, -0.27, 0.16], [-0.3, -0.3, 0.1], [0.38, 0.27, 0.12], [-0.38, 0.27, 0.08]]) {
      this.candle(lit, glow, [x + cx, top, z + cz], h);
    }
    this.skull(lit, at, new Euler(0, -0.4, 0), 0.26, 0.755, -0.18, 0.17, BONE[0]);
    this.bone(lit, at(-0.3, 0.68, 0.02), at(-0.06, 0.68, 0.16), 0.035, BONE[2]);
    for (const side of [-1, 1]) {
      const root: Vec = [x + side * 0.4, top, z - 0.3];
      const bend: Vec = [x + side * 0.5, top + 0.3, z - 0.32];
      const tip: Vec = [x + side * 0.42, top + 0.52, z - 0.26];
      this.stick(lit, root, bend, 0.08, BONE[1]);
      this.stick(lit, bend, tip, 0.05, BONE[0]);
    }
    this.skull(lit, at, new Euler(0, 0.5, 0), -0.36, 0.17, 0.36, 0.14, BONE[3]);
    this.bone(lit, at(0.2, 0.12, 0.4), at(0.42, 0.12, 0.33), 0.03, BONE[1]);
  }
}
