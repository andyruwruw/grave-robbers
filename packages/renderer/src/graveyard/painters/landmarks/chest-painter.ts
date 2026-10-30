// Packages
import { Euler } from 'three';

// Local Imports
import { pick } from '../../../helpers/pick';
import { CHEST_BAND, CHEST_WOOD, GOLD } from '../../config/palette/props';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint, StaticLight } from '../../../types/terrain';

/**
 * A treasure chest, turned a little, with iron bands and a gold clasp.
 */
export class ChestPainter extends TilePainter {
  /**
   * Paints the chest.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, glow, rand, x, z, base } = p;
    const wood = pick(rand, CHEST_WOOD);
    const turn = new Euler(0, (rand() - 0.5) * 0.5, 0);
    /**
     * Places a point given in the chest's turned local space.
     * @param dx Offset across.
     * @param y Height above the base.
     * @param dz Offset along.
     * @returns The world position.
     */
    const at = (dx: number, y: number, dz: number): [number, number, number] => {
      const c = Math.cos(turn.y);
      const s = Math.sin(turn.y);
      return [x + dx * c + dz * s, base + y, z - dx * s + dz * c];
    };
    lit.add(at(0, 0.17, 0), [0.62, 0.34, 0.42], wood, turn);
    lit.add(at(0, 0.39, 0), [0.66, 0.1, 0.46], wood, turn);
    lit.add(at(0, 0.46, 0), [0.6, 0.06, 0.34], wood, turn);
    for (const dx of [-0.21, 0.21]) {
      lit.add(at(dx, 0.25, 0), [0.06, 0.5, 0.48], CHEST_BAND, turn);
    }
    lit.add(at(0, 0.34, 0.215), [0.68, 0.035, 0.03], CHEST_BAND, turn);
    glow.add(at(0, 0.3, 0.225), [0.08, 0.1, 0.03], GOLD, turn);
  }

  /**
   * A faint candle glow on the chest, so it can be found.
   * @param p The tile being painted.
   * @param lights Where its lights go.
   */
  staticLights(p: Paint, lights: StaticLight[]): void {
    lights.push({ x: p.tx + 0.5, y: p.ty + 0.6, kind: 'candle' });
  }
}
