// Packages
import { Euler } from 'three';

// Local Imports
import { pick } from '../../../helpers/pick';
import { STUMP_RING } from '../../config/palette/ground';
import { ANVIL_FACE, ANVIL_IRON } from '../../config/palette/props';
import { IRON, PLANK, PLANK_DARK } from '../../config/palette/structures';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * An anvil on a stump, turned a little, with a hammer leaning on it.
 */
export class AnvilPainter extends TilePainter {
  /**
   * Paints the anvil.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, rand, x, z, base } = p;
    const yaw = (rand() - 0.5) * 0.4;
    const at = this.turned(x, z, base, yaw);
    const turn = new Euler(0, yaw, 0);
    lit.add(at(0, 0.16, 0), [0.42, 0.32, 0.42], pick(rand, PLANK), turn);
    lit.add(at(0, 0.33, 0), [0.44, 0.03, 0.44], STUMP_RING, turn);
    lit.add(at(0, 0.38, 0), [0.36, 0.08, 0.22], pick(rand, ANVIL_IRON), turn);
    lit.add(at(0, 0.48, 0), [0.18, 0.14, 0.14], pick(rand, ANVIL_IRON), turn);
    lit.add(at(0.02, 0.6, 0), [0.56, 0.12, 0.24], pick(rand, ANVIL_IRON), turn);
    lit.add(at(0.37, 0.62, 0), [0.18, 0.07, 0.12], pick(rand, ANVIL_IRON), turn);
    lit.add(at(0.02, 0.665, 0), [0.5, 0.01, 0.2], ANVIL_FACE, turn);
    this.stick(lit, at(-0.3, 0.38, 0.28), at(-0.12, 0.7, 0.16), 0.035, PLANK_DARK);
    lit.add(at(-0.12, 0.72, 0.16), [0.2, 0.08, 0.08], IRON, new Euler(0, yaw + 0.6, 0));
  }
}
