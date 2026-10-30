// Local Imports
import { pick } from '../../../helpers/pick';
import { CANDLE } from '../../config/palette/props';
import { CRYPT, CRYPT_DARK, CRYPT_TRIM, IRON } from '../../config/palette/structures';
import { besideDoorway, isDoorway } from '../../helpers/tile-queries';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint, StaticLight } from '../../../types/terrain';

/**
 * A crypt wall block: coursed stone with a cornice, a spire on corners, and
 * lantern pillars beside a doorway.
 */
export class CryptPainter extends TilePainter {
  /**
   * Paints the crypt.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, glow, rand, map, tx, ty, x, z } = p;
    /**
     * Whether the neighbor at an offset is also crypt wall.
     * @param dx Tile offset in x.
     * @param dy Tile offset in y.
     * @returns True when it is crypt.
     */
    const wall = (dx: number, dy: number): boolean => map.get(tx + dx, ty + dy) === 'crypt';
    /**
     * Whether the neighbor at an offset is a doorway.
     * @param dx Tile offset in x.
     * @param dy Tile offset in y.
     * @returns True when it is a doorway.
     */
    const doorBeside = (dx: number, dy: number): boolean => isDoorway(map, tx + dx, ty + dy);
    const corner = (wall(1, 0) || wall(-1, 0)) && (wall(0, 1) || wall(0, -1));
    lit.add([x, 0.1, z], [1.04, 0.2, 1.04], CRYPT_DARK);
    for (let course = 0; course < 3; course++) {
      const cy = 0.4 + course * 0.4;
      const split = course % 2 === 0 ? [[-0.25, 0.49], [0.25, 0.49]] : [[-0.375, 0.24], [0, 0.49], [0.375, 0.24]];
      for (const [offset, w] of split) {
        lit.add([x + offset, cy, z], [w, 0.38, 0.98], pick(rand, CRYPT));
      }
    }
    lit.add([x, 1.45, z], [1.1, 0.1, 1.1], pick(rand, CRYPT_TRIM));
    if (corner) {
      lit.add([x, 1.0, z], [0.6, 2.0, 0.6], pick(rand, CRYPT_TRIM));
      lit.add([x, 2.08, z], [0.7, 0.12, 0.7], CRYPT_DARK);
      lit.add([x, 2.3, z], [0.36, 0.32, 0.36], pick(rand, CRYPT_TRIM));
      lit.add([x, 2.58, z], [0.16, 0.26, 0.16], pick(rand, CRYPT_TRIM));
      lit.add([x, 2.8, z], [0.05, 0.22, 0.05], IRON);
      lit.add([x, 2.84, z], [0.16, 0.05, 0.05], IRON);
      return;
    }
    if ((tx + ty) % 2 === 0) {
      lit.add([x, 1.62, z], [0.5, 0.24, 0.5], pick(rand, CRYPT));
    }
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      if (doorBeside(dx, dy)) {
        lit.add([x + dx * 0.3, 0.9, z + dy * 0.3], [0.34, 1.8, 0.34], pick(rand, CRYPT_TRIM));
        lit.add([x + dx * 0.3, 1.86, z + dy * 0.3], [0.24, 0.14, 0.24], CRYPT_DARK);
        lit.add([x + dx * 0.3, 1.98, z + dy * 0.3], [0.3, 0.1, 0.3], IRON);
        glow.add([x + dx * 0.3, 2.08, z + dy * 0.3], [0.16, 0.12, 0.16], CANDLE);
      }
    }
  }

  /**
   * A candle on a crypt block beside a doorway, where its lantern pillar stands.
   * @param p The tile being painted.
   * @param lights Where its lights go.
   */
  staticLights(p: Paint, lights: StaticLight[]): void {
    if (besideDoorway(p.map, p.tx, p.ty)) {
      lights.push({ x: p.tx + 0.5, y: p.ty + 1, kind: 'candle' });
    }
  }
}
