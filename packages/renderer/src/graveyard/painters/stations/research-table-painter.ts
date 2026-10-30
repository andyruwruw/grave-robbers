// Packages
import { Euler } from 'three';

// Local Imports
import { pick } from '../../../helpers/pick';
import { MUSHROOM_STEM } from '../../config/palette/ground';
import { BOOK, CANDLE, PAPER } from '../../config/palette/props';
import { DOORWAY, IRON, PLANK, PLANK_DARK } from '../../config/palette/structures';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * A research table with papers, an open book, an ink pot and a candle.
 */
export class ResearchTablePainter extends TilePainter {
  /**
   * Paints the research table.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, glow, rand, x, z, base } = p;
    for (const [lx, lz] of [[-0.38, -0.22], [0.38, -0.22], [-0.38, 0.22], [0.38, 0.22]]) {
      lit.add([x + lx, base + 0.3, z + lz], [0.08, 0.6, 0.08], PLANK_DARK);
    }
    lit.add([x, base + 0.18, z], [0.76, 0.05, 0.05], PLANK_DARK);
    lit.add([x, base + 0.64, z], [0.9, 0.08, 0.58], pick(rand, PLANK));
    const top = base + 0.68;
    for (let i = 0; i < 3; i++) {
      lit.add([x - 0.22 + rand() * 0.2, top + 0.005 + i * 0.006, z + (rand() - 0.5) * 0.2], [0.2, 0.01, 0.26], pick(rand, PAPER), new Euler(0, (rand() - 0.5) * 0.8, 0));
    }
    const cover = pick(rand, BOOK);
    const turn = new Euler(0, (rand() - 0.5) * 0.4, 0);
    lit.add([x + 0.17, top + 0.015, z + 0.08], [0.36, 0.03, 0.24], cover, turn);
    lit.add([x + 0.17, top + 0.035, z + 0.08], [0.33, 0.015, 0.21], PAPER[2], turn);
    lit.add([x + 0.17, top + 0.04, z + 0.08], [0.015, 0.012, 0.21], PLANK_DARK, turn);
    lit.add([x + 0.3, top + 0.06, z - 0.16], [0.18, 0.12, 0.12], pick(rand, BOOK));
    lit.add([x + 0.3, top + 0.15, z - 0.16], [0.16, 0.06, 0.11], pick(rand, BOOK), new Euler(0, 0.3, 0));
    lit.add([x - 0.05, top + 0.035, z - 0.18], [0.06, 0.07, 0.06], DOORWAY);
    lit.add([x - 0.03, top + 0.11, z - 0.18], [0.015, 0.14, 0.015], PAPER[0], new Euler(0, 0, -0.4));
    lit.add([x - 0.33, top + 0.06, z - 0.17], [0.05, 0.12, 0.05], MUSHROOM_STEM);
    glow.add([x - 0.33, top + 0.15, z - 0.17], [0.03, 0.05, 0.03], CANDLE);
    lit.add([x - 0.33, top + 0.005, z - 0.17], [0.1, 0.01, 0.1], IRON);
  }
}
