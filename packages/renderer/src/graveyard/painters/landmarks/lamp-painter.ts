// Local Imports
import { LAMP_GLASS } from '../../config/palette/props';
import { IRON } from '../../config/palette/structures';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint, StaticLight } from '../../../types/terrain';

/**
 * An iron lamp post with a lit glass.
 */
export class LampPainter extends TilePainter {
  /**
   * Paints the lamp.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, glow, x, z, base } = p;
    lit.add([x, base + 0.05, z], [0.24, 0.1, 0.24], IRON);
    lit.add([x, base + 0.7, z], [0.08, 1.3, 0.08], IRON);
    lit.add([x, base + 1.32, z], [0.26, 0.05, 0.26], IRON);
    lit.add([x, base + 1.58, z], [0.26, 0.05, 0.26], IRON);
    glow.add([x, base + 1.45, z], [0.16, 0.22, 0.16], LAMP_GLASS);
  }

  /**
   * A light at the lamp's center.
   * @param p The tile being painted.
   * @param lights Where its lights go.
   */
  staticLights(p: Paint, lights: StaticLight[]): void {
    lights.push({ x: p.tx + 0.5, y: p.ty + 0.5, kind: 'lamp' });
  }
}
