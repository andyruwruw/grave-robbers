// Packages
import { Euler } from 'three';

// Local Imports
import { pick } from '../../../helpers/pick';
import { STONE } from '../../config/palette/ground';
import { BREW, VIAL_GLASS } from '../../config/palette/props';
import { BONE, EMBER_STONE, FORGE_IRON, IRON, PLANK } from '../../config/palette/structures';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * A cauldron of glowing brew over a fire, with a skull, a ladle bone and vials.
 */
export class CauldronPainter extends TilePainter {
  /**
   * Paints the cauldron.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, glow, rand, x, z, base } = p;
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + rand() * 0.3;
      lit.add([x + Math.cos(a) * 0.38, base + 0.05, z + Math.sin(a) * 0.38], [0.15, 0.1, 0.15], i % 2 ? EMBER_STONE : pick(rand, STONE), new Euler(0, a, 0));
    }
    lit.add([x, base + 0.06, z], [0.46, 0.08, 0.08], pick(rand, PLANK), new Euler(0, Math.PI / 4, 0.15));
    lit.add([x, base + 0.06, z], [0.46, 0.08, 0.08], pick(rand, PLANK), new Euler(0, -Math.PI / 4, -0.15));
    for (let i = 0; i < 3; i++) {
      const a = Math.PI / 2 + (i / 3) * Math.PI * 2;
      this.stick(lit, [x + Math.cos(a) * 0.34, base, z + Math.sin(a) * 0.3], [x + Math.cos(a) * 0.24, base + 0.3, z + Math.sin(a) * 0.22], 0.04, FORGE_IRON);
    }
    for (const [y, w, h] of [[0.27, 0.36, 0.06], [0.34, 0.54, 0.08], [0.44, 0.66, 0.14], [0.56, 0.62, 0.12], [0.64, 0.56, 0.06]] as const) {
      lit.add([x, base + y, z], [w, h, w * 0.86], FORGE_IRON);
      lit.add([x, base + y, z], [w * 0.86, h, w], FORGE_IRON);
    }
    for (const side of [-1, 1]) {
      lit.add([x, base + 0.69, z + side * 0.28], [0.62, 0.05, 0.06], IRON);
      lit.add([x + side * 0.28, base + 0.69, z], [0.06, 0.05, 0.62], IRON);
    }
    glow.add([x, base + 0.69, z], [0.5, 0.03, 0.5], BREW[0]);
    for (let i = 0; i < 4; i++) {
      const s = 0.04 + rand() * 0.05;
      glow.add([x + (rand() - 0.5) * 0.36, base + 0.7 + s * 0.3, z + (rand() - 0.5) * 0.36], [s, s * 0.7, s], pick(rand, BREW));
    }
    for (let i = 0; i < 3; i++) {
      const dx = (i - 1) * 0.16 + (rand() - 0.5) * 0.06;
      glow.add([x + dx, base + 0.6, z + 0.3], [0.04, 0.12 + rand() * 0.1, 0.01], BREW[2]);
    }
    this.skull(lit, this.turned(x, z, base, 0), new Euler(0.3, 0.6, 0), -0.12, 0.71, 0.05, 0.13, BONE[0]);
    this.stick(lit, [x + 0.08, base + 0.66, z - 0.05], [x + 0.3, base + 1.02, z - 0.22], 0.035, BONE[1]);
    lit.add([x + 0.31, base + 1.04, z - 0.23], [0.06, 0.05, 0.06], BONE[2]);
    for (const side of [-1, 1]) {
      lit.add([x + side * 0.34, base + 0.56, z], [0.04, 0.1, 0.04], IRON);
    }
    for (const [vx, vz] of [[0.42, 0.36], [0.33, 0.43]]) {
      lit.add([x + vx, base + 0.07, z + vz], [0.07, 0.1, 0.07], VIAL_GLASS);
      glow.add([x + vx, base + 0.055, z + vz], [0.055, 0.07, 0.055], BREW[1]);
      lit.add([x + vx, base + 0.14, z + vz], [0.035, 0.04, 0.035], pick(rand, PLANK));
    }
  }
}
