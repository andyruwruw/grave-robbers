// Packages
import { Euler } from 'three';

// Local Imports
import { pick } from '../../../helpers/pick';
import { PIT } from '../../config/palette/ground';
import { BLOODSTEEL, BLOOD_POOL, SENTRY_EYE, VIAL_GLASS } from '../../config/palette/props';
import { BONE, FORGE_IRON, PLANK } from '../../config/palette/structures';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * A sentry: a skull with glowing eyes and a blood cannon on a bone tripod.
 */
export class SentryPainter extends TilePainter {
  /**
   * Paints the sentry.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, glow, rand, x, z, base } = p;
    const yaw = (rand() < 0.5 ? -1 : 1) * (0.5 + rand() * 0.4);
    const at = this.turned(x, z, base, yaw);
    const turn = new Euler(0, yaw, 0);
    const hub = at(0, 0.5, 0);
    for (let i = 0; i < 3; i++) {
      const a = Math.PI / 2 + (i / 3) * Math.PI * 2;
      this.bone(lit, [x + Math.cos(a) * 0.38, base + 0.03, z - Math.sin(a) * 0.36], hub, 0.05, pick(rand, BONE));
    }
    lit.add(hub, [0.16, 0.08, 0.16], FORGE_IRON, turn);
    lit.add(at(0, 0.56, 0), [0.08, 0.06, 0.08], pick(rand, BLOODSTEEL), turn);
    this.skull(lit, at, turn, 0, 0.75, 0, 0.3, BONE[0], glow, SENTRY_EYE);
    lit.add(at(0, 0.62, 0.3), [0.1, 0.1, 0.32], BLOODSTEEL[1], turn);
    lit.add(at(0, 0.62, 0.2), [0.13, 0.13, 0.05], FORGE_IRON, turn);
    lit.add(at(0, 0.62, 0.46), [0.14, 0.14, 0.05], BLOODSTEEL[0], turn);
    lit.add(at(0, 0.62, 0.487), [0.07, 0.07, 0.01], PIT, turn);
    lit.add(at(0, 0.89, -0.06), [0.12, 0.03, 0.12], FORGE_IRON, turn);
    lit.add(at(0, 0.91, -0.06), [0.1, 0.03, 0.1], VIAL_GLASS, turn);
    glow.add(at(0, 0.99, -0.06), [0.08, 0.13, 0.08], BLOOD_POOL, turn);
    lit.add(at(0.042, 1.0, -0.02), [0.008, 0.12, 0.008], VIAL_GLASS, turn);
    lit.add(at(0, 1.07, -0.06), [0.1, 0.03, 0.1], VIAL_GLASS, turn);
    lit.add(at(0, 1.1, -0.06), [0.06, 0.04, 0.06], pick(rand, PLANK), turn);
  }
}
