// Packages
import { GOODS } from '@halloween/shared/goods/goods';
import { CONVEYORS, OUTPUT_HOLD } from '@halloween/shared/structures/automation';
import { STATIONS, STATION_REACH } from '@halloween/shared/structures/stations';
import { isStructure } from '@halloween/shared/structures/structure-catalog';

// Local Imports
import { heldFor } from '../helpers/held-output';
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
   * Hands what a station made to stations in reach, then, with a belt
   * leading away, holds it for the belt to pull (`out`, up to
   * OUTPUT_HOLD), then (if given) `keep`, and leaves the rest beside it: on
   * the open tile below it if there is one (toward the TV), otherwise any
   * open neighbor that isn't a belt, joining a pile already there.
   * @param tx The maker's tile column.
   * @param ty The maker's tile row.
   * @param made What it made.
   * @param keep Stores what's left with the maker, returning what didn't fit.
   */
  deliver(tx: number, ty: number, made: Bundle, keep?: (left: Bundle) => Bundle): void {
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
    const belt = sides.slice(0, 4).find(away);
    const s = this.structures.get(ty * this.map.width + tx);
    if (belt && s && heldFor(s) < OUTPUT_HOLD) {
      s.out ??= {};
      for (const g of GOODS) {
        if (made[g] > 0) {
          s.out[g] = (s.out[g] ?? 0) + made[g];
        }
      }
      return;
    }
    if (keep) {
      made = keep(made);
      if (GOODS.every((g: Goods): boolean => made[g] === 0)) {
        return;
      }
    }
    const side = sides.find(([dx, dy]): boolean => !this.map.isSolid(tx + dx, ty + dy) && this.map.get(tx + dx, ty + dy) !== 'door' && !CONVEYORS.has(this.map.get(tx + dx, ty + dy)));
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
