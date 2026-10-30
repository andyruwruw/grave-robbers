// Packages
import { Euler } from 'three';

// Local Imports
import { pick } from '../../../helpers/pick';
import { BARK, STUMP_RING } from '../../config/palette/ground';
import { SAWDUST } from '../../config/palette/props';
import { IRON, IRON_SPIKE, PLANK, PLANK_DARK } from '../../config/palette/structures';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * A sawmill bench with a log, a saw blade, and cut planks and sawdust below.
 */
export class SawmillPainter extends TilePainter {
  /**
   * Paints the sawmill.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, rand, x, z, base } = p;
    const bench = base + 0.46;
    for (const lx of [-0.33, 0.33]) {
      for (const side of [-1, 1]) {
        lit.add([x + lx, base + 0.22, z + side * 0.13], [0.07, 0.48, 0.07], PLANK_DARK, new Euler(side * 0.45, 0, 0));
      }
    }
    lit.add([x, bench - 0.04, z], [0.94, 0.08, 0.36], pick(rand, PLANK));
    lit.add([x + 0.05, bench + 0.06, z - 0.05], [0.42, 0.12, 0.12], BARK);
    lit.add([x - 0.165, bench + 0.06, z - 0.05], [0.01, 0.11, 0.11], STUMP_RING);
    const disc = new Euler(0, 0, Math.PI / 4);
    lit.add([x + 0.22, bench + 0.02, z + 0.06], [0.36, 0.36, 0.02], IRON_SPIKE);
    lit.add([x + 0.22, bench + 0.02, z + 0.06], [0.36, 0.36, 0.02], IRON_SPIKE, disc);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      lit.add([x + 0.22 + Math.cos(a) * 0.22, bench + 0.02 + Math.sin(a) * 0.22, z + 0.06], [0.05, 0.05, 0.02], IRON_SPIKE, new Euler(0, 0, a + Math.PI / 4));
    }
    lit.add([x + 0.22, bench + 0.02, z + 0.06], [0.1, 0.1, 0.04], IRON);
    lit.add([x + 0.22, bench - 0.16, z + 0.06], [0.06, 0.24, 0.06], IRON);
    for (let i = 0; i < 2; i++) {
      lit.add([x - 0.05 + rand() * 0.06, base + 0.02 + i * 0.04, z + 0.36], [0.6, 0.035, 0.12], PLANK[i + 1], new Euler(0, (rand() - 0.5) * 0.2, 0));
    }
    lit.add([x + 0.18, base + 0.008, z + 0.2], [0.34, 0.016, 0.26], SAWDUST, new Euler(0, rand(), 0));
  }
}
