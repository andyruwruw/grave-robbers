// Local Imports
import { pick } from '../../../helpers/pick';
import { BARK } from '../../config/palette/ground';
import { IRON, PLANK, PLANK_DARK } from '../../config/palette/structures';
import { WallPainter } from './wall-painter';

// Types
import type { Paint } from '../../../types/terrain';
import type { WallRun } from './wall-painter';

/**
 * A wooden wall across its tile, its boards laid the way it runs, in one
 * of its looks (see `WALL_STYLES`): upright planks on two rails, boards
 * nailed across two posts behind an X brace, or stacked round logs.
 */
export class WoodWallPainter extends WallPainter {
  /**
   * Paints the wood wall.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const run = this.wallRuns(p)[0];
    const style = this.style(p);
    if (style === 1) {
      this.boarded(p, run);
    } else if (style === 2) {
      this.logs(p, run);
    } else {
      this.planks(p, run);
    }
  }

  /**
   * Four uneven upright planks with two rails across the front.
   * @param p The tile being painted.
   * @param run The run.
   */
  private planks(p: Paint, run: WallRun): void {
    const { lit, rand } = p;
    for (let i = 0; i < 4; i++) {
      const h = 1 + rand() * 0.15;
      const along = -0.375 + i * 0.25;
      lit.add(run.at(along, h / 2, 0), [0.23, h, 0.3], pick(rand, PLANK), run.turn);
      lit.add(run.at(along, h + 0.04, 0), [0.12, 0.08, 0.12], pick(rand, PLANK), run.turn);
    }
    for (const y of [0.3, 0.75]) {
      lit.add(run.at(0, y, 0.16), [1, 0.08, 0.04], PLANK_DARK, run.turn);
    }
  }

  /**
   * Two posts with boards nailed across them, a little crooked and not
   * quite meeting, and an X of boards nailed over the front.
   * @param p The tile being painted.
   * @param run The run.
   */
  private boarded(p: Paint, run: WallRun): void {
    const { lit, rand } = p;
    for (const along of [-0.4, 0.4]) {
      lit.add(run.at(along, 0.56, -0.06), [0.14, 1.12, 0.14], PLANK_DARK, run.turn);
    }
    for (let row = 0; row < 5; row++) {
      const y = 0.14 + row * 0.2;
      const tilt = run.turn.clone();
      tilt.z = (rand() - 0.5) * 0.06;
      lit.add(run.at((rand() - 0.5) * 0.04, y, 0.03), [1 - rand() * 0.06, 0.17, 0.08], pick(rand, PLANK), tilt);
      for (const along of [-0.4, 0.4]) {
        lit.add(run.at(along, y, 0.075), [0.025, 0.025, 0.01], IRON, run.turn);
      }
    }
    for (const side of [-1, 1]) {
      lit.add(run.at(0, 0.55, 0.11 + (side > 0 ? 0.03 : 0)), [1.25, 0.13, 0.05], pick(rand, PLANK), this.diagonal(run, side));
    }
  }

  /**
   * Round logs stacked on their sides, the bottom one biggest, their bark
   * ends sticking out past the tile a little.
   * @param p The tile being painted.
   * @param run The run.
   */
  private logs(p: Paint, run: WallRun): void {
    const { lit, rand } = p;
    let y = 0;
    for (let row = 0; row < 5; row++) {
      const d = 0.26 - row * 0.015 + rand() * 0.02;
      const shift = (rand() - 0.5) * 0.06;
      lit.add(run.at(shift, y + d / 2, 0), [1.04, d, d], pick(rand, PLANK), run.turn);
      lit.add(run.at(shift, y + d / 2, 0), [1.08, d * 0.7, d * 0.7], BARK, run.turn);
      y += d * 0.92;
    }
  }

  /**
   * The turn of a board across the front, slanting up one way or the
   * other.
   * @param run The run.
   * @param side Which way it slants.
   * @returns Its turn.
   */
  private diagonal(run: WallRun, side: number): WallRun['turn'] {
    const turn = run.turn.clone();
    turn.order = 'YXZ';
    turn.z = side * Math.atan2(0.9, 0.84);
    return turn;
  }
}
