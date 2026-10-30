// Packages
import { Euler } from 'three';

// Local Imports
import { pick } from '../../../helpers/pick';
import { STONE } from '../../config/palette/ground';
import { BONE, BONE_PACK } from '../../config/palette/structures';
import { WallPainter } from './wall-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * A wall of stacked bones and skulls on a stone footing, along each wall line it
 * joins.
 */
export class BoneWallPainter extends WallPainter {
  /**
   * Paints the bone wall.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, rand, x, z, base } = p;
    for (const horizontal of this.runs(p)) {
      const yaw = horizontal ? 0 : Math.PI / 2;
      const at = this.turned(x, z, base, yaw);
      const turn = new Euler(0, yaw, 0);
      lit.add(at(0, 0.06, 0), [1, 0.12, 0.46], pick(rand, STONE), turn);
      lit.add(at(0, 0.58, 0), [0.98, 0.92, 0.22], BONE_PACK, turn);
      for (let row = 0; row < 5; row++) {
        const y = 0.2 + row * 0.19;
        for (const dz of [-0.1, 0.1]) {
          let start = -0.5 + (row % 2 ? 0.12 : 0) - rand() * 0.08;
          while (start < 0.44) {
            const end = Math.min(0.48, start + 0.32 + rand() * 0.18);
            if (end - start > 0.12) {
              this.bone(lit, at(start + 0.05, y + (rand() - 0.5) * 0.03, dz), at(end - 0.05, y + (rand() - 0.5) * 0.03, dz), 0.075, pick(rand, BONE));
            }
            start = end + 0.02;
          }
        }
      }
      for (const row of [1, 3]) {
        this.skull(lit, at, turn, (rand() - 0.5) * 0.6, 0.2 + row * 0.19, 0.12, 0.2, pick(rand, BONE));
      }
      if (rand() < 0.6) {
        this.skull(lit, at, new Euler(0, yaw + (rand() - 0.5) * 0.6, 0), (rand() - 0.5) * 0.5, 1.15, 0, 0.18, pick(rand, BONE));
      }
    }
  }
}
