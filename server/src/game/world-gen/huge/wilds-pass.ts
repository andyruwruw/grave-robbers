// Local Imports
import {
  FOREST_FROM,
  FOREST_SCALE,
  GRAVEFIELD_BOOST,
  GRAVEFIELD_FROM,
  GRAVEFIELD_SCALE,
  LONE_GRAVES,
  LONE_PUMPKINS,
  LONE_ROCKS,
  LONE_TREES,
  PUMPKINS_ROADSIDE,
  ROCKS_HIGH,
} from '../config/huge';
import { DIRS } from '../config/classic';
import { GenPass } from '../gen-pass';
import { noise } from '../helpers/noise';
import { padOwners } from '../helpers/sites';

// Types
import type { Tile } from '@halloween/shared/world/tiles';
import type { Site } from '../types/sites';

/**
 * The wilds between a huge world's sites.
 */
export class WildsPass extends GenPass {
  /**
   * Over the grass off every site's pad: thick woods where the forest
   * noise is high, and a scattering of trees, rocks (more on raised
   * ground), lone graves (many more in old burial grounds, where their
   * own noise is high), and pumpkins (more beside roads) everywhere else,
   * each times its knob.
   * @param sites Every site.
   */
  wilds(sites: Site[]): void {
    const forest = noise(this._canvas.rand, FOREST_SCALE);
    const burial = noise(this._canvas.rand, GRAVEFIELD_SCALE);
    const owner = padOwners(this.map, sites);
    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        if (this.map.get(x, y) !== 'grass' || owner[this.map.index(x, y)] >= 0) {
          continue;
        }
        const f = forest(x, y);
        const roll = this.rand();
        const roadside = DIRS.some(([dx, dy]): boolean => this.map.get(x + dx, y + dy) === 'path');
        const tree = LONE_TREES * this.gen.trees;
        const rock = tree + LONE_ROCKS * this.gen.rocks * (this.map.level(x, y) > 0 ? ROCKS_HIGH : 1);
        const grave = rock + LONE_GRAVES * this.gen.graves * (burial(x, y) > GRAVEFIELD_FROM ? GRAVEFIELD_BOOST : 1);
        const pumpkin = grave + LONE_PUMPKINS * this.gen.pumpkins * (roadside ? PUMPKINS_ROADSIDE : 1);
        let tile: Tile = 'grass';
        if (f > FOREST_FROM && !roadside && roll < (f - FOREST_FROM) * 2.2 * this.gen.forest) {
          tile = 'tree';
        } else if (roll < tree) {
          tile = 'tree';
        } else if (roll < rock) {
          tile = 'rock';
        } else if (roll < grave) {
          tile = this.rand() < 0.6 ? 'tombstone' : 'cross';
        } else if (roll < pumpkin) {
          tile = 'pumpkin';
        }
        this.map.set(x, y, tile);
      }
    }
  }
}
