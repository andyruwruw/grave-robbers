// Packages
import { Euler } from 'three';

// Local Imports
import { pick } from '../../../helpers/pick';
import { DIRT } from '../../config/palette/ground';
import { PAPER } from '../../config/palette/props';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * A planted seed bed: mounded dirt with seeds.
 */
export class SeedsPainter extends TilePainter {
  /**
   * Paints the seeds.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, rand, x, z, base } = p;
    for (let i = 0; i < 3; i++) {
      lit.add([x + (rand() - 0.5) * 0.2, base + 0.04, z + (rand() - 0.5) * 0.2], [0.5 - i * 0.1, 0.08, 0.5 - i * 0.1], pick(rand, DIRT), new Euler(0, rand() * Math.PI, 0));
    }
    for (let i = 0; i < 5; i++) {
      lit.add([x + (rand() - 0.5) * 0.3, base + 0.1, z + (rand() - 0.5) * 0.3], [0.04, 0.02, 0.03], PAPER[0], new Euler(0, rand() * Math.PI, 0));
    }
  }
}
