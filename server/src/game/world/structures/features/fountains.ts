// Packages
import { stock } from '@halloween/shared/goods/goods';
import { FOUNTAIN_BLOOD } from '@halloween/shared/structures/traps';

// Local Imports
import { WorldFeature } from '../../world-feature';

// Types
import type { WorldSite } from '../../types/site';
import type { StationOutput } from '../station-output';

/**
 * Blood fountains, which turn what they drain from monsters into blood.
 */
export class Fountains extends WorldFeature {
  /**
   * Sets the fountains up.
   * @param site What every part of the world shares.
   * @param _output Where the blood they pump goes.
   */
  constructor(site: WorldSite, private readonly _output: StationOutput) {
    super(site);
  }

  /**
   * A blood fountain pumps out FOUNTAIN_BLOOD blood for each point of
   * damage it drains from a monster standing in it.
   * @param tx The fountain's tile column.
   * @param ty The fountain's tile row.
   * @param drained Damage drained from the monster.
   */
  pump(tx: number, ty: number, drained: number): void {
    const s = this.structures.get(ty * this.map.width + tx);
    if (!s || this.map.get(tx, ty) !== 'blood-fountain') {
      return;
    }
    s.pumped = (s.pumped ?? 0) + drained * FOUNTAIN_BLOOD;
    const blood = Math.floor(s.pumped);
    if (blood > 0) {
      s.pumped -= blood;
      this._output.deliver(tx, ty, stock({ blood }));
    }
  }
}
