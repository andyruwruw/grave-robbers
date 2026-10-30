// Local Imports
import { IRON_SPIKE, PLANK_DARK } from '../../config/palette/structures';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * A board of wooden-mounted iron spikes.
 */
export class SpikesPainter extends TilePainter {
  /**
   * Paints the spikes.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, rand, x, z, base } = p;
    lit.add([x, base + 0.04, z], [0.84, 0.08, 0.84], PLANK_DARK);
    for (let sy = 0; sy < 3; sy++) {
      for (let sx = 0; sx < 3; sx++) {
        const sh = 0.25 + rand() * 0.12;
        lit.add([x - 0.27 + sx * 0.27, base + 0.08 + sh / 2, z - 0.27 + sy * 0.27], [0.06, sh, 0.06], IRON_SPIKE);
      }
    }
  }
}
