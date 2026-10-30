// Packages
import { HUGE_SIZE, MAP_HEIGHT, MAP_WIDTH } from '@halloween/shared/world/dimensions';

// Local Imports
import { DISTRICT_EDGE, DISTRICT_GRID } from '../config/huge';
import { GenPass } from '../gen-pass';

// Types
import type { WorldMap } from '@halloween/shared/world/world-map';
import type { Rect } from '../types/geometry';

/**
 * The districts of a huge world: where each classic graveyard goes, and
 * copying one in.
 */
export class DistrictPass extends GenPass {
  /**
   * Lays the districts on a DISTRICT_GRID square grid, each nudged
   * randomly within its cell and kept DISTRICT_EDGE tiles in from the
   * map's edge.
   * @returns Each district's footprint, row by row.
   */
  layDistricts(): Rect[] {
    const cell = Math.floor(HUGE_SIZE / DISTRICT_GRID);
    const out: Rect[] = [];
    for (let gy = 0; gy < DISTRICT_GRID; gy++) {
      for (let gx = 0; gx < DISTRICT_GRID; gx++) {
        const x = Math.max(DISTRICT_EDGE, Math.min(HUGE_SIZE - DISTRICT_EDGE - MAP_WIDTH, gx * cell + Math.floor(this.rand() * Math.max(0, cell - MAP_WIDTH))));
        const y = Math.max(DISTRICT_EDGE, Math.min(HUGE_SIZE - DISTRICT_EDGE - MAP_HEIGHT, gy * cell + Math.floor(this.rand() * Math.max(0, cell - MAP_HEIGHT))));
        out.push({ x, y, w: MAP_WIDTH, h: MAP_HEIGHT });
      }
    }
    return out;
  }

  /**
   * Copies a classic graveyard into the big map at `r`: its tiles, levels,
   * and turned stairs, with its fence taken down (and its spawn paved over
   * unless it's the one to keep).
   * @param r Where it goes.
   * @param district The classic map.
   * @param keepSpawn Whether its spawn stays.
   */
  stamp(r: Rect, district: WorldMap, keepSpawn: boolean): void {
    const turns = district.encodeRamps();
    for (let y = 0; y < district.height; y++) {
      for (let x = 0; x < district.width; x++) {
        let tile = district.get(x, y);
        if (tile === 'fence') {
          tile = 'grass';
        } else if (tile === 'spawn' && !keepSpawn) {
          tile = 'cobble';
        }
        this.map.set(r.x + x, r.y + y, tile);
        this.map.setLevel(r.x + x, r.y + y, district.level(x, y));
        const turn = Number(turns[district.index(x, y)]);
        this.map.setRamp(r.x + x, r.y + y, turn > 0 ? turn - 1 : null);
      }
    }
  }
}
