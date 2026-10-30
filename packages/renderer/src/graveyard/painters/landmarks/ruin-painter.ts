// Packages
import { Euler } from 'three';

// Local Imports
import { pick } from '../../../helpers/pick';
import { MOSS } from '../../config/palette/ground';
import { BRICK } from '../../config/palette/structures';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * A crumbling brick wall, running toward its ruin neighbors.
 */
export class RuinPainter extends TilePainter {
  /**
   * Paints the ruin.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, rand, map, tx, ty, x, z } = p;
    const alongX = map.get(tx - 1, ty) === 'ruin' || map.get(tx + 1, ty) === 'ruin';
    const alongZ = map.get(tx, ty - 1) === 'ruin' || map.get(tx, ty + 1) === 'ruin';
    const layers = 2 + Math.floor(rand() * 3);
    for (const horizontal of alongX || !alongZ ? [true, ...(alongZ ? [false] : [])] : [false]) {
      for (let layer = 0; layer < layers; layer++) {
        for (let i = 0; i < 2; i++) {
          if (layer > 1 && layer === layers - 1 && rand() < 0.35) {
            continue;
          }
          const offset = -0.25 + i * 0.5 + (layer % 2 ? 0.08 : -0.08);
          const pos: [number, number, number] = horizontal ? [x + offset, 0.15 + layer * 0.3, z] : [x, 0.15 + layer * 0.3, z + offset];
          const size: [number, number, number] = horizontal ? [0.48, 0.28, 0.5] : [0.5, 0.28, 0.48];
          lit.add(pos, size, pick(rand, BRICK));
        }
      }
    }
    if (rand() < 0.5) {
      lit.add([x + (rand() - 0.5) * 0.3, layers * 0.3 + 0.01, z], [0.3, 0.03, 0.4], pick(rand, MOSS));
    }
    lit.add([x + (rand() - 0.5) * 0.8, 0.06, z + (rand() - 0.5) * 0.8], [0.18, 0.12, 0.16], pick(rand, BRICK), new Euler(0, rand(), 0.2));
  }
}
