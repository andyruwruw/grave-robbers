// Packages
import { Euler } from 'three';

// Local Imports
import { pick } from '../../../helpers/pick';
import { BRASS, OVEN_FIRE, PILOT, TANK } from '../../config/palette/props';
import { FORGE_IRON, FURNACE_STONE, IRON, PLANK } from '../../config/palette/structures';
import { TilePainter } from '../tile-painter';

// Types
import type { Paint } from '../../../types/terrain';

/**
 * A flamethrower: a fuel tank and nozzle on a stone base, with a pilot light.
 */
export class FlamethrowerPainter extends TilePainter {
  /**
   * Paints the flamethrower.
   * @param p The tile being painted.
   */
  paint(p: Paint): void {
    const { lit, glow, rand, x, z, base } = p;
    const yaw = (rand() - 0.5) * 0.6;
    const at = this.turned(x, z, base, yaw);
    const turn = new Euler(0, yaw, 0);
    lit.add(at(0, 0.09, 0), [0.66, 0.18, 0.66], pick(rand, FURNACE_STONE), turn);
    lit.add(at(0, 0.42, -0.08), [0.36, 0.5, 0.36], pick(rand, TANK), turn);
    for (const y of [0.24, 0.42, 0.6]) {
      lit.add(at(0, y, -0.08), [0.38, 0.04, 0.38], BRASS, turn);
    }
    lit.add(at(0, 0.7, -0.08), [0.2, 0.06, 0.2], FORGE_IRON, turn);
    lit.add(at(0, 0.45, 0.22), [0.12, 0.12, 0.34], FORGE_IRON, turn);
    lit.add(at(0, 0.45, 0.42), [0.16, 0.16, 0.08], IRON, turn);
    lit.add(at(0, 0.52, 0.28), [0.04, 0.08, 0.04], BRASS, turn);
    glow.add(at(0, 0.45, 0.47), [0.06, 0.06, 0.02], PILOT, turn);
    glow.add(at(0, 0.38, 0.47), [0.04, 0.04, 0.02], OVEN_FIRE[0], turn);
    for (let i = 0; i < 3; i++) {
      lit.add(at(-0.24 + i * 0.07, 0.04, 0.3 + rand() * 0.06), [0.2, 0.06, 0.06], pick(rand, PLANK), new Euler(0, yaw + rand(), 0));
    }
  }
}
