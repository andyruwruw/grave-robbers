// Packages
import { Euler } from 'three';

// Local Imports
import { pick } from '../../../helpers/pick';
import { STONE } from '../../config/palette/ground';
import { ANVIL_IRON, GRIT, MESH_WIRE, PICK_HEAD } from '../../config/palette/props';
import { IRON, PLANK_DARK } from '../../config/palette/structures';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * A quarry: a stepped block of bedrock under an iron A-frame, a pick
 * hanging from it on a chain, and a stack of cut stone beside it.
 */
export class QuarryPainter extends TilePainter {
  /**
   * Paints the quarry.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, rand, x, z, base } = p;
    lit.add([x - 0.05, base + 0.1, z - 0.05], [0.66, 0.2, 0.56], pick(rand, STONE));
    lit.add([x - 0.1, base + 0.26, z - 0.1], [0.44, 0.12, 0.36], pick(rand, STONE));
    lit.add([x + 0.08, base + 0.205, z - 0.12], [0.18, 0.012, 0.3], pick(rand, GRIT));
    for (let i = 0; i < 4; i++) {
      lit.add([x + (rand() - 0.5) * 0.6, base + 0.02, z + 0.28 + rand() * 0.1], [0.06, 0.04, 0.05], pick(rand, GRIT), new Euler(0, rand() * Math.PI, 0));
    }
    for (const side of [-1, 1]) {
      lit.add([x + side * 0.3, base + 0.62, z - 0.05], [0.06, 1.2, 0.06], pick(rand, ANVIL_IRON), new Euler(0, 0, side * 0.22));
      lit.add([x + side * 0.38, base + 0.04, z - 0.05], [0.14, 0.06, 0.14], IRON);
    }
    lit.add([x, base + 1.2, z - 0.05], [0.42, 0.07, 0.08], pick(rand, ANVIL_IRON));
    for (let i = 0; i < 5; i++) {
      lit.add([x, base + 1.12 - i * 0.08, z - 0.05], [0.025, 0.06, 0.025], MESH_WIRE);
    }
    lit.add([x, base + 0.68, z - 0.05], [0.05, 0.12, 0.05], PLANK_DARK);
    lit.add([x, base + 0.6, z - 0.05], [0.3, 0.05, 0.06], PICK_HEAD, new Euler(0, 0, 0.15));
    const sx = x + 0.3;
    const sz = z + 0.3;
    for (const [dx, dy, dz] of [[-0.08, 0, 0], [0.08, 0, 0], [0, 0.1, 0]]) {
      lit.add([sx + dx, base + 0.05 + dy, sz + dz], [0.14, 0.1, 0.16], pick(rand, STONE), new Euler(0, (rand() - 0.5) * 0.3, 0));
    }
  }
}
