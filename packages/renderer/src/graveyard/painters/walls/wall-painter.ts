// Packages
import { Euler } from 'three';

// Local Imports
import { WALLS } from '../../config/terrain-shape';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint, Vec } from '../../../types/terrain';

/**
 * One straight stretch of wall across a tile, in its own frame: `at(along,
 * y, out)` places a point `along` the run (-0.5 to 0.5) and `out` across it
 * (positive is the side the wall faces), and `turn` turns a box the same
 * way.
 */
export interface WallRun {
  /**
   * Whether it runs along x (else along z).
   */
  horizontal: boolean;

  /**
   * Places a point in the run's frame.
   */
  at: (along: number, y: number, out: number) => Vec;

  /**
   * The run's turn, for boxes.
   */
  turn: Euler;

  /**
   * The run's yaw, for anything turned further.
   */
  yaw: number;
}

/**
 * The base for walls that join up with their neighbors.
 */
export abstract class WallPainter extends TilePainter {
  /**
   * Whether the neighbor at an offset is a wall to join.
   * @param p The tile being painted.
   * @param dx Column offset.
   * @param dy Row offset.
   * @returns True if it's a wall.
   */
  protected joins(p: Paint, dx: number, dy: number): boolean {
    return WALLS.has(p.map.get(p.tx + dx, p.ty + dy));
  }

  /**
   * The ways the wall runs across this tile: along any line of walls it
   * joins (both at a corner), or, standing alone, across the way it was
   * turned to face (along x if it never was).
   * @param p The tile being painted.
   * @returns For each run, whether it runs along x.
   */
  protected runs(p: Paint): boolean[] {
    const alongZ = this.joins(p, 0, 1) || this.joins(p, 0, -1);
    const alongX = this.joins(p, 1, 0) || this.joins(p, -1, 0);
    if (!alongX && !alongZ) {
      const turn = p.map.turnOf(p.tx, p.ty);
      return [!turn || turn[0] === 0];
    }
    return [alongX, alongZ].flatMap((on: boolean, i: number): boolean[] => (on ? [i === 0] : []));
  }

  /**
   * Each run with its frame, facing the way the wall was turned (a run
   * that the turn lies along faces +z or +x).
   * @param p The tile being painted.
   * @returns The runs.
   */
  protected wallRuns(p: Paint): WallRun[] {
    const turn = p.map.turnOf(p.tx, p.ty);
    return this.runs(p).map((horizontal: boolean): WallRun => {
      const facing = horizontal ? turn?.[1] : turn?.[0];
      const yaw = (horizontal ? 0 : Math.PI / 2) + (facing === -1 ? Math.PI : 0);
      return { horizontal, at: this.turned(p.x, p.z, p.base, yaw), turn: new Euler(0, yaw, 0), yaw };
    });
  }

  /**
   * Which look the wall was built in (see `WALL_STYLES`).
   * @param p The tile being painted.
   * @returns The look, 0 for the plain one.
   */
  protected style(p: Paint): number {
    return p.map.styleOf(p.tx, p.ty);
  }
}
