// Local Imports
import { WALLS } from '../../config/terrain-shape';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * A wall-like tile that lines up with the walls beside it.
 */
export abstract class WallPainter extends TilePainter {
  /**
   * Whether the neighbor (dx, dy) is a wall this one lines up with.
   * @param p The tile being painted.
   * @param dx Step east.
   * @param dy Step south.
   * @returns True when the neighbor is in WALLS.
   */
  protected joins(p: Paint, dx: number, dy: number): boolean {
    return WALLS.has(p.map.get(p.tx + dx, p.ty + dy));
  }

  /**
   * Which ways the wall runs: along x when it joins a wall east or west (or
   * joins nothing north or south), and along z when it joins one north or
   * south.
   * @param p The tile being painted.
   * @returns One entry per run, true for along x and false for along z.
   */
  protected runs(p: Paint): boolean[] {
    const alongZ = this.joins(p, 0, 1) || this.joins(p, 0, -1);
    const alongX = this.joins(p, 1, 0) || this.joins(p, -1, 0) || !alongZ;
    return [alongX, alongZ].flatMap((on: boolean, i: number): boolean[] => (on ? [i === 0] : []));
  }
}
