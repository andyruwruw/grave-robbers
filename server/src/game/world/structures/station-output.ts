// Packages
import { GOODS } from '@halloween/shared/goods/goods';
import { STATIONS, STATION_REACH } from '@halloween/shared/structures/stations';
import { isStructure } from '@halloween/shared/structures/structure-catalog';

// Local Imports
import { pileNear } from '../items/pile-lookup';
import { WorldFeature } from '../world-feature';

// Types
import type { Bundle, Goods } from '@halloween/shared/goods/goods';

/**
 * Where what a station, digger, or fountain makes goes: into nearby
 * stations first, then onto the ground beside it.
 */
export class StationOutput extends WorldFeature {
  /**
   * Leaves what a station made beside it: on the open tile below it if
   * there is one (toward the TV), otherwise any open neighbor, joining a
   * pile already there.
   * @param tx The maker's tile column.
   * @param ty The maker's tile row.
   * @param made What it made.
   */
  deliver(tx: number, ty: number, made: Bundle): void {
    made = { ...made };
    for (const [j, other] of this.structures.entries()) {
      const ox = j % this.map.width;
      const oy = Math.floor(j / this.map.width);
      const kind = this.map.get(ox, oy);
      const station = isStructure(kind) ? STATIONS[kind] : undefined;
      if (!station || !other.buffer || (ox === tx && oy === ty) || Math.hypot(ox - tx, oy - ty) > STATION_REACH) {
        continue;
      }
      for (const g of GOODS) {
        const room = station.input[g] * 2 - (other.buffer[g] ?? 0);
        const moved = Math.min(made[g], Math.max(0, room));
        other.buffer[g] = (other.buffer[g] ?? 0) + moved;
        made[g] -= moved;
      }
    }
    if (GOODS.every((g: Goods): boolean => made[g] === 0)) {
      return;
    }
    const sides: [number, number][] = [[0, 1], [1, 0], [-1, 0], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]];
    const away = ([dx, dy]: [number, number]): boolean => {
      const turn = this.map.get(tx + dx, ty + dy) === 'belt' ? this.map.turnOf(tx + dx, ty + dy) : null;
      return !!turn && (turn[0] !== -dx || turn[1] !== -dy);
    };
    const side = sides.slice(0, 4).find(away) ?? sides.find(([dx, dy]): boolean => !this.map.isSolid(tx + dx, ty + dy) && this.map.get(tx + dx, ty + dy) !== 'door');
    const x = tx + 0.5 + (side ? side[0] * 0.75 : 0);
    const y = ty + 0.5 + (side ? side[1] * 0.75 : 0.6);
    const pile = pileNear(this.items, x, y, 0.3);
    if (pile) {
      for (const g of GOODS) {
        pile[g] += made[g];
      }
      return;
    }
    this.items.addItem(x, y, made, null);
  }
}
