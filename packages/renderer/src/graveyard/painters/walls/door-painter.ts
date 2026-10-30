// Packages
import { Euler } from 'three';

// Local Imports
import { pick } from '../../../helpers/pick';
import { PLANK, PLANK_DARK } from '../../config/palette/structures';
import { WallPainter } from './wall-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * A wooden door in its frame, turned to the walls beside it.
 */
export class DoorPainter extends WallPainter {
  /**
   * Paints the door.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, rand, map, tx, ty, x, z, base } = p;
    const alongX = map.isSolid(tx - 1, ty) || map.isSolid(tx + 1, ty) || !(map.isSolid(tx, ty - 1) || map.isSolid(tx, ty + 1));
    const rot = new Euler(0, alongX ? 0 : Math.PI / 2, 0);
    const [ox, oz] = alongX ? [0.44, 0] : [0, 0.44];
    lit.add([x - ox, base + 0.55, z - oz], [0.12, 1.1, 0.12], PLANK_DARK);
    lit.add([x + ox, base + 0.55, z + oz], [0.12, 1.1, 0.12], PLANK_DARK);
    lit.add([x, base + 1.05, z], [0.98, 0.1, 0.14], PLANK_DARK, rot);
    lit.add([x, base + 0.48, z], [0.76, 0.9, 0.08], pick(rand, PLANK), rot);
    lit.add([x, base + 0.48, z], [0.78, 0.07, 0.1], PLANK_DARK, rot);
  }
}
