// Packages
import { Euler } from 'three';

// Local Imports
import { pick } from '../../../helpers/pick';
import { MOSS, MUSHROOM_STEM, STONE } from '../../config/palette/ground';
import { CANDLE } from '../../config/palette/props';
import { STATUE } from '../../config/palette/structures';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint, StaticLight } from '../../../types/terrain';

/**
 * A robed statue on a plinth, with candles at its feet.
 */
export class StatuePainter extends TilePainter {
  /**
   * Paints the statue.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, glow, rand, x, z, base } = p;
    const stone = pick(rand, STATUE);
    for (const [cx, ch] of [[-0.18, 0.1], [0.04, 0.14], [0.2, 0.08]]) {
      lit.add([x + cx, base + 0.3 + ch / 2, z + 0.36], [0.05, ch, 0.05], MUSHROOM_STEM);
      glow.add([x + cx, base + 0.32 + ch, z + 0.36], [0.03, 0.05, 0.03], CANDLE);
    }
    const facing = new Euler(0, (rand() - 0.5) * 0.4, 0);
    lit.add([x, base + 0.15, z], [0.62, 0.3, 0.62], pick(rand, STONE));
    lit.add([x, base + 0.62, z], [0.3, 0.64, 0.24], stone, facing);
    lit.add([x, base + 1.04, z], [0.18, 0.2, 0.18], stone, facing);
    lit.add([x - 0.2, base + 0.85, z - 0.12], [0.08, 0.55, 0.3], stone, new Euler(0.2, 0.3, 0.3));
    lit.add([x + 0.2, base + 0.85, z - 0.12], [0.08, 0.55, 0.3], stone, new Euler(0.2, -0.3, -0.3));
    if (rand() < 0.6) {
      lit.add([x - 0.1, base + 0.32, z + 0.2], [0.3, 0.04, 0.2], pick(rand, MOSS));
    }
  }

  /**
   * A candle at the statue's feet.
   * @param p The tile being painted.
   * @param lights Where its lights go.
   */
  staticLights(p: Paint, lights: StaticLight[]): void {
    lights.push({ x: p.tx + 0.5, y: p.ty + 1, kind: 'candle' });
  }
}
