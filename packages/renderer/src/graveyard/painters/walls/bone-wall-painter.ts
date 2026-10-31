// Packages
import { Euler } from 'three';

// Local Imports
import { pick } from '../../../helpers/pick';
import { STONE } from '../../config/palette/ground';
import { BONE, BONE_PACK } from '../../config/palette/structures';
import { WallPainter } from './wall-painter';

// Types
import type { Paint } from '../../../types/terrain';
import type { WallRun } from './wall-painter';

/**
 * A wall of bones on a stone footing, along each wall line it joins, in
 * one of its looks (see `WALL_STYLES`): bones packed in rows with skulls
 * set in, a great ribcage on a spine, or a heap of skulls.
 */
export class BoneWallPainter extends WallPainter {
  /**
   * Paints the wall.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const style = this.style(p);
    for (const run of this.wallRuns(p)) {
      p.lit.add(run.at(0, 0.06, 0), [1, 0.12, 0.46], pick(p.rand, STONE), run.turn);
      if (style === 1) {
        this.ribcage(p, run);
      } else if (style === 2) {
        this.skulls(p, run);
      } else {
        this.packed(p, run);
      }
    }
  }

  /**
   * Rows of bones packed both sides of a dark core, two skulls set in the
   * face, and sometimes one on top.
   * @param p The tile being painted.
   * @param run The run.
   */
  private packed(p: Paint, run: WallRun): void {
    const { lit, rand } = p;
    lit.add(run.at(0, 0.58, 0), [0.98, 0.92, 0.22], BONE_PACK, run.turn);
    for (let row = 0; row < 5; row++) {
      const y = 0.2 + row * 0.19;
      for (const out of [-0.1, 0.1]) {
        let start = -0.5 + (row % 2 ? 0.12 : 0) - rand() * 0.08;
        while (start < 0.44) {
          const end = Math.min(0.48, start + 0.32 + rand() * 0.18);
          if (end - start > 0.12) {
            this.bone(lit, run.at(start + 0.05, y + (rand() - 0.5) * 0.03, out), run.at(end - 0.05, y + (rand() - 0.5) * 0.03, out), 0.075, pick(rand, BONE));
          }
          start = end + 0.02;
        }
      }
    }
    for (const row of [1, 3]) {
      this.skull(lit, run.at, run.turn, (rand() - 0.5) * 0.6, 0.2 + row * 0.19, 0.12, 0.2, pick(rand, BONE));
    }
    if (rand() < 0.6) {
      this.skull(lit, run.at, new Euler(0, run.yaw + (rand() - 0.5) * 0.6, 0), (rand() - 0.5) * 0.5, 1.15, 0, 0.18, pick(rand, BONE));
    }
  }

  /**
   * A spine along the top on two leg bones, ribs curving down from it on
   * both sides, the front ones bowing outward.
   * @param p The tile being painted.
   * @param run The run.
   */
  private ribcage(p: Paint, run: WallRun): void {
    const { lit, rand } = p;
    for (const along of [-0.4, 0.4]) {
      this.bone(lit, run.at(along, 0.12, 0), run.at(along, 1.05, 0), 0.08, pick(rand, BONE));
    }
    this.bone(lit, run.at(-0.48, 1.08, 0), run.at(0.48, 1.08, 0), 0.09, pick(rand, BONE));
    for (let i = 0; i < 6; i++) {
      const along = -0.4 + i * 0.16;
      lit.add(run.at(along, 1.08, 0), [0.07, 0.11, 0.13], pick(rand, BONE), run.turn);
      for (const side of [-1, 1]) {
        const bow = side > 0 ? 0.26 : 0.16;
        const color = pick(rand, BONE);
        this.stick(lit, run.at(along, 1.04, side * 0.04), run.at(along, 0.72, side * bow), 0.055, color);
        this.stick(lit, run.at(along, 0.72, side * bow), run.at(along, 0.3, side * (bow - 0.06)), 0.05, color);
      }
    }
    this.skull(lit, run.at, run.turn, 0, 0.32, 0.18, 0.2, pick(rand, BONE));
  }

  /**
   * Skulls heaped four, three, then two high, turned this way and that,
   * with loose bones at the foot.
   * @param p The tile being painted.
   * @param run The run.
   */
  private skulls(p: Paint, run: WallRun): void {
    const { lit, rand } = p;
    lit.add(run.at(0, 0.45, 0), [0.9, 0.7, 0.2], BONE_PACK, run.turn);
    const rows: [number, number][] = [[4, 0.2], [3, 0.5], [2, 0.78]];
    for (const [count, y] of rows) {
      for (let i = 0; i < count; i++) {
        const along = (i - (count - 1) / 2) * 0.24 + (rand() - 0.5) * 0.04;
        for (const out of [-1, 1]) {
          const face = new Euler((rand() - 0.5) * 0.3, run.yaw + (out < 0 ? Math.PI : 0) + (rand() - 0.5) * 0.7, 0);
          const at = out < 0 ? (a: number, h: number, o: number): [number, number, number] => run.at(-a, h, -o) : run.at;
          this.skull(lit, at, face, out < 0 ? -along : along, y, 0.08, 0.22, pick(rand, BONE));
        }
      }
    }
    this.skull(lit, run.at, new Euler(0, run.yaw + (rand() - 0.5) * 0.8, 0), (rand() - 0.5) * 0.2, 1.02, 0, 0.2, pick(rand, BONE));
    for (let i = 0; i < 3; i++) {
      const along = -0.35 + rand() * 0.7;
      this.bone(lit, run.at(along - 0.12, 0.15, 0.24 + rand() * 0.06), run.at(along + 0.12, 0.15, 0.2 + rand() * 0.06), 0.06, pick(rand, BONE));
    }
  }
}
