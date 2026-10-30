// Packages
import { Euler } from 'three';

// Local Imports
import { pick } from '../../../helpers/pick';
import { GRIT, MESH_WIRE, SILVER, SILVER_FLECK } from '../../config/palette/props';
import { PLANK, PLANK_DARK } from '../../config/palette/structures';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * A sifter: a trough of grit with silver flecks, a mesh tray on legs, and a heap
 * of sifted gravel.
 */
export class SifterPainter extends TilePainter {
  /**
   * Paints the sifter.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, glow, rand, x, z, base } = p;
    lit.add([x, base + 0.03, z], [0.72, 0.04, 0.44], PLANK_DARK);
    for (const side of [-1, 1]) {
      lit.add([x, base + 0.12, z + side * 0.22], [0.76, 0.2, 0.04], pick(rand, PLANK));
      lit.add([x + side * 0.36, base + 0.12, z], [0.04, 0.2, 0.44], pick(rand, PLANK));
    }
    lit.add([x, base + 0.13, z], [0.66, 0.08, 0.38], pick(rand, GRIT));
    for (let i = 0; i < 4; i++) {
      lit.add([x + (rand() - 0.5) * 0.56, base + 0.18, z + (rand() - 0.5) * 0.3], [0.08, 0.03, 0.07], pick(rand, GRIT), new Euler(0, rand() * Math.PI, 0));
    }
    for (let i = 0; i < 3; i++) {
      glow.add([x + (rand() - 0.5) * 0.5, base + 0.175, z + (rand() - 0.5) * 0.28], [0.035, 0.02, 0.035], SILVER_FLECK);
    }
    for (const [lx, lz] of [[-0.4, -0.27], [0.4, -0.27], [-0.4, 0.27], [0.4, 0.27]]) {
      lit.add([x + lx, base + 0.36, z + lz], [0.07, 0.72, 0.07], PLANK_DARK);
    }
    const tray = base + 0.6;
    for (const side of [-1, 1]) {
      lit.add([x, tray, z + side * 0.25], [0.76, 0.08, 0.05], pick(rand, PLANK));
      lit.add([x + side * 0.37, tray, z], [0.05, 0.08, 0.5], pick(rand, PLANK));
      lit.add([x + side * 0.47, tray, z], [0.16, 0.04, 0.05], PLANK_DARK);
    }
    for (let i = 0; i < 6; i++) {
      lit.add([x - 0.3 + i * 0.12, tray - 0.02, z], [0.016, 0.016, 0.46], MESH_WIRE);
    }
    for (let i = 0; i < 4; i++) {
      lit.add([x, tray - 0.02, z - 0.18 + i * 0.12], [0.7, 0.016, 0.016], MESH_WIRE);
    }
    for (let i = 0; i < 3; i++) {
      const s = 0.07 + rand() * 0.05;
      lit.add([x + (rand() - 0.5) * 0.4, tray + s * 0.3, z + (rand() - 0.5) * 0.24], [s, s * 0.6, s], pick(rand, GRIT), new Euler(0, rand() * Math.PI, 0));
    }
    const hx = x + 0.3;
    const hz = z + 0.38;
    lit.add([hx, base + 0.04, hz], [0.3, 0.08, 0.16], pick(rand, GRIT));
    lit.add([hx - 0.02, base + 0.1, hz], [0.18, 0.06, 0.12], pick(rand, GRIT));
    lit.add([hx - 0.03, base + 0.14, hz], [0.08, 0.04, 0.07], pick(rand, GRIT));
    glow.add([hx + 0.08, base + 0.085, hz + 0.05], [0.03, 0.02, 0.03], SILVER_FLECK);
    lit.add([hx - 0.1, base + 0.09, hz + 0.06], [0.05, 0.03, 0.05], SILVER[0]);
  }
}
