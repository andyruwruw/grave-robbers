// Packages
import { Euler } from 'three';

// Local Imports
import { pick } from '../../../helpers/pick';
import { BARK, LEAVES, PINE } from '../../config/palette/ground';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * A tree: dead, pine, or twisted, picked by the tile's seed.
 */
export class TreePainter extends TilePainter {
  /**
   * Paints the tree.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const style = p.rand();
    if (style < 0.5) {
      this.deadTree(p);
    } else if (style < 0.8) {
      this.pineTree(p);
    } else {
      this.twistedTree(p);
    }
  }

  /**
   * A bare dead tree: a trunk with four branches reaching up and out.
   * @param p The tile being painted.
   */
  private deadTree(p: Paint): void {
    const { lit, rand, x, z, base } = p;
    lit.add([x, base + 0.9, z], [0.3, 1.8, 0.3], BARK);
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + rand();
      const tiltUp = 0.4 + rand() * 0.5;
      const len = 0.5 + rand() * 0.4;
      const baseY = base + 1.0 + rand() * 0.7;
      const dirX = Math.cos(angle);
      const dirZ = -Math.sin(angle);
      const reach = Math.cos(tiltUp) * len / 2;
      lit.add(
        [x + dirX * reach, baseY + Math.sin(tiltUp) * len / 2, z + dirZ * reach],
        [len, 0.1, 0.1],
        BARK,
        new Euler(0, angle, tiltUp, 'YXZ'),
      );
    }
  }

  /**
   * A pine: a short trunk under five shrinking tiers of needles.
   * @param p The tile being painted.
   */
  private pineTree(p: Paint): void {
    const { lit, rand, x, z, base } = p;
    lit.add([x, base + 0.25, z], [0.2, 0.5, 0.2], BARK);
    const tiers = [0.95, 0.78, 0.6, 0.4, 0.2];
    tiers.forEach((w: number, i: number): void => {
      lit.add([x, base + 0.55 + i * 0.32, z], [w, 0.34, w], pick(rand, PINE), new Euler(0, rand() * 0.6, 0));
    });
  }

  /**
   * A twisted tree: a crooked trunk under a clump of autumn leaves.
   * @param p The tile being painted.
   */
  private twistedTree(p: Paint): void {
    const { lit, rand, x, z, base } = p;
    let cx = x;
    let cz = z;
    for (let i = 0; i < 4; i++) {
      lit.add([cx, base + 0.25 + i * 0.4, cz], [0.26, 0.45, 0.26], BARK, new Euler((rand() - 0.5) * 0.4, 0, (rand() - 0.5) * 0.4));
      cx += (rand() - 0.5) * 0.18;
      cz += (rand() - 0.5) * 0.18;
    }
    for (let i = 0; i < 4; i++) {
      lit.add([cx + (rand() - 0.5) * 0.7, base + 1.55 + rand() * 0.4, cz + (rand() - 0.5) * 0.7], [0.45, 0.35, 0.45], pick(rand, LEAVES), new Euler(0, rand(), 0));
    }
  }
}
