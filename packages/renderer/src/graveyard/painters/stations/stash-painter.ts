// Local Imports
import { pick } from '../../../helpers/pick';
import { CHEST_BAND, STASH_LOCK, STASH_PLANK_LINE, STASH_WOOD } from '../../config/palette/props';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * A banded wooden stash crate with a lock.
 */
export class StashPainter extends TilePainter {
  /**
   * Paints the stash.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, rand, x, z, base } = p;
    const wood = pick(rand, STASH_WOOD);
    lit.add([x, base + 0.05, z], [0.74, 0.1, 0.52], STASH_PLANK_LINE);
    lit.add([x, base + 0.24, z], [0.7, 0.3, 0.48], wood);
    lit.add([x, base + 0.17, z + 0.242], [0.7, 0.02, 0.01], STASH_PLANK_LINE);
    lit.add([x, base + 0.43, z], [0.74, 0.08, 0.52], wood);
    lit.add([x, base + 0.5, z], [0.66, 0.05, 0.44], wood);
    for (const dx of [-0.3, 0.3]) {
      lit.add([x + dx, base + 0.27, z], [0.05, 0.52, 0.54], CHEST_BAND);
    }
    lit.add([x, base + 0.32, z + 0.265], [0.1, 0.12, 0.03], STASH_LOCK);
    lit.add([x, base + 0.3, z + 0.28], [0.03, 0.04, 0.01], CHEST_BAND);
  }
}
