// Local Imports
import { pick } from '../../../helpers/pick';
import { MOSS, STONE } from '../../config/palette/ground';
import { BRICK, SOOT } from '../../config/palette/structures';
import { WallPainter } from './wall-painter';

// Types
import type { Paint } from '../../../types/terrain';
import type { WallRun } from './wall-painter';

/**
 * A solid stone wall filling its tile, its courses laid along the way it
 * runs, in one of its looks (see `WALL_STYLES`): laid brick, rough
 * fieldstone with a capstone, or a crumbling ruin with moss on its face
 * and fallen stones in front.
 */
export class StoneWallPainter extends WallPainter {
  /**
   * Paints the wall.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const run = this.wallRuns(p)[0];
    const style = this.style(p);
    if (style === 1) {
      this.fieldstone(p, run);
    } else if (style === 2) {
      this.ruin(p, run);
    } else {
      this.brick(p, run);
    }
  }

  /**
   * Three courses of bricks, every other one offset by half a brick.
   * @param p The tile being painted.
   * @param run The run.
   */
  private brick(p: Paint, run: WallRun): void {
    const { lit, rand } = p;
    for (let row = 0; row < 3; row++) {
      const y = 0.15 + row * 0.3;
      const bricks: [number, number][] = row % 2 === 0 ? [[-0.25, 0.48], [0.25, 0.48]] : [[-0.375, 0.23], [0, 0.48], [0.375, 0.23]];
      for (const [along, w] of bricks) {
        lit.add(run.at(along, y, 0), [w, 0.28, 0.9], pick(rand, BRICK), run.turn);
      }
    }
  }

  /**
   * Rough stones of every size piled in uneven courses on a dark footing,
   * under a long capstone.
   * @param p The tile being painted.
   * @param run The run.
   */
  private fieldstone(p: Paint, run: WallRun): void {
    const { lit, rand } = p;
    lit.add(run.at(0, 0.05, 0), [1, 0.1, 0.92], SOOT, run.turn);
    let y = 0.1;
    while (y < 0.78) {
      const h = 0.16 + rand() * 0.12;
      let along = -0.5;
      while (along < 0.48) {
        const w = Math.min(0.5 - along, 0.18 + rand() * 0.26);
        lit.add(run.at(along + w / 2, y + h / 2, (rand() - 0.5) * 0.06), [w - 0.02, h - 0.02, 0.84 + rand() * 0.08], pick(rand, STONE), run.turn);
        along += w;
      }
      y += h;
    }
    lit.add(run.at(0, y + 0.06, 0), [1.02, 0.12, 0.96], pick(rand, BRICK), run.turn);
  }

  /**
   * Brick courses with stones missing and a ragged top, moss creeping up
   * its face, and a few fallen bricks in front.
   * @param p The tile being painted.
   * @param run The run.
   */
  private ruin(p: Paint, run: WallRun): void {
    const { lit, rand } = p;
    for (let row = 0; row < 3; row++) {
      const y = 0.15 + row * 0.3;
      const bricks: [number, number][] = row % 2 === 0 ? [[-0.25, 0.48], [0.25, 0.48]] : [[-0.375, 0.23], [0, 0.48], [0.375, 0.23]];
      for (const [along, w] of bricks) {
        if (row > 0 && rand() < (row === 2 ? 0.45 : 0.12)) {
          continue;
        }
        const sag = row === 2 ? rand() * 0.08 : 0;
        lit.add(run.at(along, y - sag, (rand() - 0.5) * 0.04), [w, 0.28 - sag, 0.9 - rand() * 0.08], pick(rand, BRICK), run.turn);
      }
    }
    for (let i = 0; i < 4; i++) {
      lit.add(run.at(-0.4 + rand() * 0.8, 0.08 + rand() * 0.3, 0.455), [0.12 + rand() * 0.16, 0.1 + rand() * 0.14, 0.02], pick(rand, MOSS), run.turn);
    }
    for (let i = 0; i < 2; i++) {
      lit.add(run.at(-0.3 + rand() * 0.6, 0.05, 0.6 + rand() * 0.2), [0.2, 0.1, 0.14], pick(rand, BRICK), run.turn);
    }
  }
}
