// Packages
import { Euler } from 'three';

// Local Imports
import { pick } from '../../../helpers/pick';
import { LAMP_GLASS } from '../../config/palette/props';
import { DOORWAY, IRON, MARBLE } from '../../config/palette/structures';
import { isMausoleumDoor } from '../../helpers/tile-queries';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint, StaticLight } from '../../../types/terrain';

/**
 * A mausoleum block: marble with a broken roof, pillars along the front, and a
 * door and lamp in the middle of the front.
 */
export class MausoleumPainter extends TilePainter {
  /**
   * Paints the mausoleum.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, glow, rand, map, tx, ty, x, z } = p;
    /**
     * Whether the neighbor at an offset is also mausoleum.
     * @param dx Tile offset in x.
     * @param dy Tile offset in y.
     * @returns True when it is mausoleum.
     */
    const same = (dx: number, dy: number): boolean => map.get(tx + dx, ty + dy) === 'mausoleum';
    const w = same(-1, 0) && same(1, 0) ? 1 : 0.96;
    const d = same(0, -1) && same(0, 1) ? 1 : 0.94;
    lit.add([x, 0.45, z], [w, 0.9, d], pick(rand, MARBLE));
    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 2; j++) {
        const h = 0.1 + rand() * 0.45;
        lit.add([x - w / 4 + i * (w / 2), 0.9 + h / 2, z - d / 4 + j * (d / 2)], [w / 2 - 0.02, h, d / 2 - 0.02], pick(rand, MARBLE));
      }
    }
    if (rand() < 0.4) {
      lit.add([x + (rand() - 0.5) * 0.5, 1.0, z + (rand() - 0.5) * 0.5], [0.3, 0.2, 0.22], pick(rand, MARBLE), new Euler(rand() * 0.4, rand(), rand() * 0.4));
    }
    if (!same(0, 1)) {
      lit.add([x - 0.4, 0.6, z + 0.5], [0.14, 1.2, 0.14], pick(rand, MARBLE));
      lit.add([x + 0.4, 0.6, z + 0.5], [0.14, 1.2, 0.14], pick(rand, MARBLE));
      if (same(-1, 0) && same(1, 0)) {
        lit.add([x, 0.42, z + 0.48], [0.42, 0.84, 0.04], DOORWAY);
        lit.add([x, 0.03, z + 0.62], [0.6, 0.06, 0.24], pick(rand, MARBLE));
        lit.add([x, 1.0, z + 0.56], [0.12, 0.04, 0.12], IRON);
        glow.add([x, 0.9, z + 0.56], [0.08, 0.12, 0.08], LAMP_GLASS);
      }
    }
  }

  /**
   * A candle at the door, on the middle front tile.
   * @param p The tile being painted.
   * @param lights Where its lights go.
   */
  staticLights(p: Paint, lights: StaticLight[]): void {
    if (isMausoleumDoor(p.map, p.tx, p.ty)) {
      lights.push({ x: p.tx + 0.5, y: p.ty + 1, kind: 'candle' });
    }
  }
}
