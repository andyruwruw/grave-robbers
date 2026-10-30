// Local Imports
import { CANDLE, PUMPKIN, PUMPKIN_STEM } from '../../config/palette/props';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint, StaticLight } from '../../../types/terrain';

/**
 * A jack-o'-lantern with a glowing face.
 */
export class PumpkinPainter extends TilePainter {
  /**
   * Paints the pumpkin.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, glow, x, z, base } = p;
    lit.add([x, base + 0.22, z], [0.6, 0.44, 0.54], PUMPKIN);
    lit.add([x, base + 0.22, z], [0.66, 0.36, 0.3], PUMPKIN);
    lit.add([x, base + 0.5, z], [0.08, 0.14, 0.08], PUMPKIN_STEM);
    glow.add([x - 0.13, base + 0.3, z + 0.272], [0.1, 0.08, 0.02], CANDLE);
    glow.add([x + 0.13, base + 0.3, z + 0.272], [0.1, 0.08, 0.02], CANDLE);
    glow.add([x, base + 0.15, z + 0.272], [0.3, 0.06, 0.02], CANDLE);
  }

  /**
   * A light at the pumpkin's center.
   * @param p The tile being painted.
   * @param lights Where its lights go.
   */
  staticLights(p: Paint, lights: StaticLight[]): void {
    lights.push({ x: p.tx + 0.5, y: p.ty + 0.5, kind: 'pumpkin' });
  }
}
