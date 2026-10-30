// Local Imports
import {
  FOREST_FROM,
  FOREST_SCALE,
  LONE_GRAVES,
  LONE_PUMPKINS,
  LONE_ROCKS,
  LONE_TREES,
} from '../config/huge';
import { GenPass } from '../gen-pass';
import { noise } from '../helpers/noise';

// Types
import type { Tile } from '@halloween/shared/world/tiles';

/**
 * The wild woods between a huge world's districts.
 */
export class WildsPass extends GenPass {
  /**
   * Thick woods where the forest noise is high, and a scattering of trees,
   * rocks, pumpkins, and lone graves everywhere else (each times its knob).
   * @param inDistrict Whether a tile belongs to a district (left alone).
   */
  wilds(inDistrict: (x: number, y: number) => boolean): void {
    const forest = noise(this._canvas.rand, FOREST_SCALE);
    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        if (inDistrict(x, y)) {
          continue;
        }
        const f = forest(x, y);
        const roll = this.rand();
        let tile: Tile = 'grass';
        if (f > FOREST_FROM && roll < (f - FOREST_FROM) * 2.2 * this.gen.forest) {
          tile = 'tree';
        } else if (roll < LONE_TREES * this.gen.trees) {
          tile = 'tree';
        } else if (roll < (LONE_TREES * this.gen.trees) + LONE_ROCKS * this.gen.rocks) {
          tile = 'rock';
        } else if (roll < (LONE_TREES * this.gen.trees) + LONE_ROCKS * this.gen.rocks + LONE_GRAVES * this.gen.graves) {
          tile = this.rand() < 0.6 ? 'tombstone' : 'cross';
        } else if (roll < (LONE_TREES * this.gen.trees) + LONE_ROCKS * this.gen.rocks + LONE_GRAVES * this.gen.graves + LONE_PUMPKINS * this.gen.pumpkins) {
          tile = 'pumpkin';
        }
        this.map.set(x, y, tile);
      }
    }
  }
}
