// Local Imports
import { IRON, IRON_SPIKE, PALE_IRON } from '../../config/palette/structures';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * An iron plate bristling with tipped spikes.
 */
export class IronSpikesPainter extends TilePainter {
  /**
   * Paints the iron spikes.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, rand, x, z, base } = p;
    lit.add([x, base + 0.04, z], [0.88, 0.08, 0.88], IRON);
    for (let sy = 0; sy < 4; sy++) {
      for (let sx = 0; sx < 4; sx++) {
        const sh = 0.32 + rand() * 0.14;
        lit.add([x - 0.3 + sx * 0.2, base + 0.08 + sh / 2, z - 0.3 + sy * 0.2], [0.05, sh, 0.05], IRON_SPIKE);
        lit.add([x - 0.3 + sx * 0.2, base + 0.08 + sh + 0.02, z - 0.3 + sy * 0.2], [0.025, 0.05, 0.025], PALE_IRON);
      }
    }
  }
}
