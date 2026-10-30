// Packages
import { stock } from '@halloween/shared/goods/goods';
import {
  DIGGER_BONES,
  DIGGER_CANDY,
  DIGGER_CANDY_CHANCE,
  DIGGER_FLOORS,
} from '@halloween/shared/structures/automation';
import { diggerSeconds } from '@halloween/shared/skill-tree/upgrades/structure-upgrades';

// Local Imports
import { TickingFeature } from './ticking-feature';

// Types
import type { WorldSite } from '../../types/site';
import type { DugGrave, StructureState } from '../../types/structures';
import type { StationOutput } from '../station-output';

/**
 * Bone diggers: each digs up the grave it stands on, again and again.
 */
export class Diggers extends TickingFeature {
  /**
   * Graves dug since the last take.
   */
  private _dug: DugGrave[] = [];

  /**
   * Sets the diggers up.
   * @param site What every part of the world shares.
   * @param _output Where what they dig up goes.
   */
  constructor(site: WorldSite, private readonly _output: StationOutput) {
    super(site);
  }

  /**
   * A bone digger digs up the grave it stands on again each time it would
   * have filled (`diggerSeconds`): mostly bones, rarely a little candy,
   * handed to a station or belt in reach or left beside it. One left from
   * an older save standing off a grave does nothing.
   * @param tx The digger's tile column.
   * @param ty The digger's tile row.
   * @param s The digger's state.
   * @param dt Seconds since the last step.
   */
  tick(tx: number, ty: number, s: StructureState, dt: number): void {
    if (!DIGGER_FLOORS.has(s.floor)) {
      return;
    }
    s.progress = (s.progress ?? 0) + dt;
    if (s.progress < diggerSeconds(s.level ?? 0)) {
      return;
    }
    s.progress = 0;
    const roll = ([min, max]: [number, number]): number => min + Math.floor(Math.random() * (max - min + 1));
    this._dug.push({ tx, ty, tile: s.floor === 'cross' ? 'cross' : 'tombstone' });
    this._output.deliver(tx, ty, stock({ bone: roll(DIGGER_BONES), candy: Math.random() < DIGGER_CANDY_CHANCE ? roll(DIGGER_CANDY) : 0 }));
  }

  /**
   * Graves the bone diggers dug since the last call, for the TV's dirt.
   * @returns The graves dug.
   */
  takeDug(): DugGrave[] {
    const dug = this._dug;
    this._dug = [];
    return dug;
  }
}
