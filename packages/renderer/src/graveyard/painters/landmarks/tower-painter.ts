// Local Imports
import { pick } from '../../../helpers/pick';
import { TOWER_STONE } from '../../config/palette/tower';
import { TOWER_COURSE } from '../../config/terrain-shape';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint, StaticLight } from '../../../types/terrain';

/**
 * The watchtower's lowest course (the rest is the cutaway model from
 * `buildTower`).
 */
export class TowerPainter extends TilePainter {
  /**
   * Paints the tower.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, rand, x, z, base } = p;
    lit.add([x, base + TOWER_COURSE / 2, z], [1, TOWER_COURSE, 1], pick(rand, TOWER_STONE));
  }

  /**
   * A candle in the middle of a lone tower tile (one with no tower beside it).
   * @param p The tile being painted.
   * @param lights Where its lights go.
   */
  staticLights(p: Paint, lights: StaticLight[]): void {
    const { map, tx, ty } = p;
    if ([[1, 0], [-1, 0], [0, 1], [0, -1]].every(([dx, dy]): boolean => map.get(tx + dx, ty + dy) !== 'tower')) {
      lights.push({ x: tx + 0.5, y: ty + 0.5, kind: 'candle' });
    }
  }
}
