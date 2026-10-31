// Packages
import { GOODS, stock } from '@halloween/shared/goods/goods';
import { MOUND_REFILL_MIN, MOUND_REFILL_SPREAD } from '@halloween/shared/loot/graves';

// Local Imports
import { WorldFeature } from '../world-feature';

// Types
import type { BagItem } from '@halloween/shared/inventory/bag-items';
import type { SpilledStash, StashView } from '../types/structures';

/**
 * Structures taking damage and breaking, and what broken storage chests
 * spill.
 */
export class StructureDamage extends WorldFeature {
  /**
   * What broken storage chests held since the last take.
   */
  private _spilledStashes: SpilledStash[] = [];

  /**
   * Damages the structure on a tile, restoring the floor if it breaks (a
   * mound under it starts filling again, and a bone digger's hoard spills
   * for its builder alone).
   * @param tx The tile's column.
   * @param ty The tile's row.
   * @param amount Hit points to take off.
   */
  damage(tx: number, ty: number, amount: number): void {
    const i = ty * this.map.width + tx;
    const s = this.structures.get(i);
    if (!s) {
      return;
    }
    s.hp -= amount;
    if (s.hp <= 0) {
      this.structures.delete(i);
      this.map.set(tx, ty, s.floor);
      if (s.floor === 'mound') {
        this.timers.mounds.set(i, this.clock.now + MOUND_REFILL_MIN + Math.random() * MOUND_REFILL_SPREAD);
      }
      if (s.hoard && GOODS.some((g): boolean => (s.hoard![g] ?? 0) > 0)) {
        this.items.addItem(tx + 0.5, ty + 0.5, stock(s.hoard), null, s.owner ?? null);
      }
      if (s.stash?.some((item: BagItem | null): boolean => item !== null)) {
        this._spilledStashes.push({ x: tx + 0.5, y: ty + 0.5, keeper: s.keeper ?? '', items: s.stash.filter((item): item is BagItem => item !== null) });
      }
    }
  }

  /**
   * A storage chest's slots and keeper at a tile, or null.
   * @param tx The tile's column.
   * @param ty The tile's row.
   * @returns The chest's keeper and live slots, or null.
   */
  stashAt(tx: number, ty: number): StashView | null {
    const s = this.structures.get(ty * this.map.width + tx);
    return s?.stash && this.map.get(tx, ty) === 'stash' ? { keeper: s.keeper ?? '', items: s.stash } : null;
  }

  /**
   * Returns and clears what broken storage chests held, for `Game` to
   * leave on the ground for their keepers.
   * @returns What spilled since the last call.
   */
  takeSpilledStashes(): SpilledStash[] {
    const spilled = this._spilledStashes;
    this._spilledStashes = [];
    return spilled;
  }
}
