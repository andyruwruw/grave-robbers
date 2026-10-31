// Packages
import { stock } from '@halloween/shared/goods/goods';
import { FOUNTAIN_BLOOD } from '@halloween/shared/structures/traps';

// Local Imports
import { VICTIM_HOLD } from '../../config/fountains';
import { WorldFeature } from '../../world-feature';

// Types
import type { MonsterKind } from '@halloween/shared/monsters/monster-kinds';
import type { VictimState } from '@halloween/shared/protocol/state/world-state';
import type { WorldSite } from '../../types/site';
import type { StationOutput } from '../station-output';

/**
 * A monster a fountain holds, and when it last stood in it.
 */
interface Victim {
  /**
   * The monster's id.
   */
  id: number;

  /**
   * The monster's kind.
   */
  kind: MonsterKind;

  /**
   * Clock seconds it was last in the fountain.
   */
  seen: number;
}

/**
 * Blood fountains, which turn what they drain from monsters into blood,
 * and the one monster each holds at a time (its victim, whose head the TV
 * floats in the basin).
 */
export class Fountains extends WorldFeature {
  /**
   * Each fountain's victim, by tile index.
   */
  private readonly _victims = new Map<number, Victim>();

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

  /**
   * A monster stands in a blood fountain this tick: it becomes the
   * fountain's victim unless another one still is.
   * @param tx The fountain's tile column.
   * @param ty The fountain's tile row.
   * @param id The monster's id.
   * @param kind The monster's kind.
   * @returns Whether the fountain just caught it.
   */
  hold(tx: number, ty: number, id: number, kind: MonsterKind): boolean {
    const i = ty * this.map.width + tx;
    const now = this.clock.now;
    const victim = this._victims.get(i);
    if (victim && now - victim.seen <= VICTIM_HOLD) {
      if (victim.id === id) {
        victim.seen = now;
      }
      return false;
    }
    this._victims.set(i, { id, kind, seen: now });
    return true;
  }

  /**
   * Every fountain's victim, letting go of those that left, died, or whose
   * fountain is gone.
   * @returns The victims, for the TV.
   */
  victimStates(): VictimState[] {
    const out: VictimState[] = [];
    const now = this.clock.now;
    for (const [i, { id, kind, seen }] of this._victims) {
      if (now - seen > VICTIM_HOLD || this.map.get(i % this.map.width, Math.floor(i / this.map.width)) !== 'blood-fountain') {
        this._victims.delete(i);
      } else {
        out.push({ i, id, kind });
      }
    }
    return out;
  }
}
