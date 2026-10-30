// Packages
import { GOODS } from '@halloween/shared/goods/goods';
import { WORKING_GLOW } from '@halloween/shared/structures/lights';
import { STATIONS, STATION_REACH } from '@halloween/shared/structures/stations';
import { isStructure } from '@halloween/shared/structures/structure-catalog';
import { stationSeconds } from '@halloween/shared/skill-tree/upgrades/structure-upgrades';

// Local Imports
import { TickingFeature } from './ticking-feature';

// Types
import type { Bundle, Goods } from '@halloween/shared/goods/goods';
import type { Station, StructureKind } from '@halloween/shared/structures/types/structures';
import type { WorldSite } from '../../types/site';
import type { StructureState } from '../../types/structures';
import type { StationOutput } from '../station-output';

/**
 * Crafting stations: fed by hand or from piles in reach, working through
 * their queue, and glowing while they work.
 */
export class Stations extends TickingFeature {
  /**
   * Sets the stations up.
   * @param site What every part of the world shares.
   * @param _output Where finished batches go.
   */
  constructor(site: WorldSite, private readonly _output: StationOutput) {
    super(site);
  }

  /**
   * Pulls in goods, works on the current batch, hands it out when done,
   * and glows while there is work queued.
   * @param tx The station's tile column.
   * @param ty The station's tile row.
   * @param s The station's state.
   * @param dt Seconds since the last step.
   */
  tick(tx: number, ty: number, s: StructureState, dt: number): void {
    const kind = this.map.get(tx, ty) as StructureKind;
    this.supply(tx, ty, s, STATIONS[kind]!);
    s.progress = s.queue! > 0 ? (s.progress ?? 0) + dt : 0;
    if (s.queue! > 0 && s.progress >= stationSeconds(kind, s.level ?? 0)) {
      s.queue!--;
      s.progress = 0;
      this._output.deliver(tx, ty, STATIONS[kind]!.output);
    }
    s.fuel = s.queue! > 0 ? WORKING_GLOW : 0;
  }

  /**
   * Feeds one batch into the station on a tile, if `pay` can cover its
   * input. Returns false if it's not a station, it's full, or nothing was
   * paid.
   * @param tx The tile's column.
   * @param ty The tile's row.
   * @param pay Pays the cost and says whether it could.
   * @returns Whether a batch was queued.
   */
  feed(tx: number, ty: number, pay: (cost: Bundle) => boolean): boolean {
    const tile = this.map.get(tx, ty);
    const station = isStructure(tile) ? STATIONS[tile] : undefined;
    const s = this.structures.get(ty * this.map.width + tx);
    if (!station || !s || (s.queue ?? 0) >= station.queue || !pay(station.input)) {
      return false;
    }
    s.queue = (s.queue ?? 0) + 1;
    return true;
  }

  /**
   * Fills a station's buffer from piles within reach (only what its input
   * asks for), then turns every full batch in the buffer into a queued one.
   * @param tx The station's tile column.
   * @param ty The station's tile row.
   * @param s The station's state.
   * @param station What the station takes and makes.
   */
  private supply(tx: number, ty: number, s: StructureState, station: Station): void {
    s.buffer ??= {};
    for (const [id, item] of this.items.entries()) {
      if (item.held || Math.hypot(item.x - (tx + 0.5), item.y - (ty + 0.5)) > STATION_REACH) {
        continue;
      }
      for (const g of GOODS) {
        const want = Math.max(0, station.input[g] * 2 - (s.buffer[g] ?? 0));
        const moved = Math.min(want, item[g]);
        item[g] -= moved;
        s.buffer[g] = (s.buffer[g] ?? 0) + moved;
      }
      this.items.dropIfEmpty(id, item);
    }
    while ((s.queue ?? 0) < station.queue && GOODS.every((g: Goods): boolean => (s.buffer![g] ?? 0) >= station.input[g])) {
      for (const g of GOODS) {
        s.buffer[g] = (s.buffer[g] ?? 0) - station.input[g];
      }
      s.queue = (s.queue ?? 0) + 1;
    }
  }
}
