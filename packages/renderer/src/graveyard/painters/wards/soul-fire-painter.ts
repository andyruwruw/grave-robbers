// Packages
import { Euler } from 'three';

// Local Imports
import { pick } from '../../../helpers/pick';
import { SOUL_GLOW, SOUL_STONE } from '../../config/palette/props';
import { BONE, SOCKET } from '../../config/palette/structures';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * A ring of stones and glowing bones around crossed bones.
 */
export class SoulFirePainter extends TilePainter {
  /**
   * Paints the soul fire.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, glow, rand, x, z, base } = p;
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const bone = i % 3 === 0;
      lit.add([x + Math.cos(a) * 0.38, base + (bone ? 0.1 : 0.08), z + Math.sin(a) * 0.38], bone ? [0.14, 0.14, 0.14] : [0.16, 0.16, 0.16], bone ? pick(rand, BONE) : pick(rand, SOUL_STONE), new Euler(0, a, 0));
      if (bone) {
        glow.add([x + Math.cos(a) * 0.45, base + 0.11, z + Math.sin(a) * 0.45], [0.03, 0.03, 0.03], SOUL_GLOW);
      }
    }
    lit.add([x, base + 0.08, z], [0.5, 0.08, 0.5], SOCKET);
    lit.add([x, base + 0.12, z], [0.5, 0.08, 0.08], pick(rand, BONE), new Euler(0, Math.PI / 4, 0.2));
    lit.add([x, base + 0.12, z], [0.5, 0.08, 0.08], pick(rand, BONE), new Euler(0, -Math.PI / 4, 0.2));
  }
}
