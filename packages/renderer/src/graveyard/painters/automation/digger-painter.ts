// Packages
import { Euler, Vector3 } from 'three';

// Local Imports
import { pick } from '../../../helpers/pick';
import { DIRT, STONE } from '../../config/palette/ground';
import { DIGGER_EYE, PICK_HEAD } from '../../config/palette/props';
import { BONE, IRON, PLANK_DARK } from '../../config/palette/structures';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint, Vec } from '../../../types/terrain';

/**
 * A digger: a skeleton with a pick by a stone, glowing eyes and loose stones.
 */
export class DiggerPainter extends TilePainter {
  /**
   * Paints the digger.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, glow, rand, x, z, base } = p;
    lit.add([x, base + 0.05, z - 0.18], [0.7, 0.1, 0.5], pick(rand, DIRT));
    lit.add([x + 0.05, base + 0.3, z - 0.38], [0.36, 0.5, 0.1], pick(rand, STONE), new Euler(-0.15, 0.1, 0.08));
    lit.add([x + 0.05, base + 0.58, z - 0.42], [0.22, 0.08, 0.1], pick(rand, STONE), new Euler(-0.15, 0.1, 0.08));
    const yaw = 0.5 + (rand() - 0.5) * 0.5;
    const at = this.turned(x, z, base, yaw);
    const turn = new Euler(0, yaw, 0);
    /**
     * Picks a bone color.
     * @returns The color.
     */
    const b = (): string => pick(rand, BONE);
    for (const side of [-1, 1]) {
      lit.add(at(side * 0.07, 0.02, 0.03), [0.07, 0.04, 0.11], b(), turn);
      this.bone(lit, at(side * 0.07, 0.05, 0), at(side * 0.07, 0.22, 0.01), 0.035, b());
      this.bone(lit, at(side * 0.07, 0.24, 0.01), at(side * 0.08, 0.42, 0), 0.04, b());
    }
    lit.add(at(0, 0.45, 0), [0.22, 0.08, 0.12], b(), turn);
    lit.add(at(0, 0.6, -0.04), [0.04, 0.24, 0.04], b(), turn);
    for (let i = 0; i < 3; i++) {
      lit.add(at(0, 0.6 + i * 0.065, 0), [0.24 - Math.abs(i - 1) * 0.03, 0.03, 0.15], b(), turn);
    }
    lit.add(at(0, 0.66, 0.07), [0.03, 0.15, 0.02], b(), turn);
    lit.add(at(0, 0.78, -0.01), [0.3, 0.04, 0.05], b(), turn);
    lit.add(at(0, 0.82, -0.01), [0.035, 0.05, 0.035], b(), turn);
    this.skull(lit, at, turn, 0, 0.92, 0, 0.2, BONE[0], glow, DIGGER_EYE);
    const low = new Vector3(0, 0.74, 0.25);
    const high = new Vector3(0.16, 1.16, -0.05);
    const along = high.clone().sub(low).normalize();
    const grip = low.clone().addScaledVector(along, 0.06);
    const grip2 = low.clone().addScaledVector(along, 0.16);
    /**
     * Places a point given in the digger's turned local space.
     * @param p The local point.
     * @returns The world position.
     */
    const v = (p: Vector3): Vec => at(p.x, p.y, p.z);
    this.stick(lit, v(low), v(high.clone().addScaledVector(along, 0.03)), 0.035, PLANK_DARK);
    const head = new Vector3(0, 0, 1).addScaledVector(along, -along.z).normalize();
    this.stick(lit, v(high.clone().addScaledVector(head, -0.2)), v(high.clone().addScaledVector(head, 0.22)), 0.045, PICK_HEAD);
    this.stick(lit, v(high.clone().addScaledVector(head, 0.2)), v(high.clone().addScaledVector(head, 0.27)), 0.025, PICK_HEAD);
    lit.add(v(high), [0.07, 0.07, 0.07], IRON, turn);
    for (const [shoulder, elbow, hand] of [
      [new Vector3(0.14, 0.78, 0), new Vector3(0.18, 0.66, 0.12), grip],
      [new Vector3(-0.14, 0.78, 0), new Vector3(-0.1, 0.68, 0.16), grip2],
    ]) {
      this.bone(lit, v(shoulder), v(elbow), 0.03, b());
      this.bone(lit, v(elbow), v(hand), 0.028, b());
    }
    for (let i = 0; i < 3; i++) {
      const s = 0.06 + rand() * 0.06;
      lit.add([x + (rand() - 0.5) * 0.7, base + s * 0.3, z + 0.25 + rand() * 0.15], [s, s * 0.6, s], pick(rand, rand() < 0.5 ? STONE : DIRT), new Euler(0, rand() * Math.PI, 0));
    }
  }
}
