// Packages
import { GROW_SECONDS } from '@halloween/shared/loot/pumpkins';

// Local Imports
import { WorldFeature } from '../../world-feature';

/**
 * Planted pumpkin seeds and sprouts, which grow when watered.
 */
export class Gardens extends WorldFeature {
  /**
   * Waters pumpkin seeds (they sprout) or a sprout (it becomes a pumpkin),
   * if GROW_SECONDS have passed since it was planted or last watered.
   * Returns whether it grew, 'wait' if it's too soon, or null if there's
   * nothing to water.
   * @param tx The tile's column.
   * @param ty The tile's row.
   * @returns Whether it grew, or 'wait' if it's too soon.
   */
  water(tx: number, ty: number): boolean | 'wait' {
    const i = ty * this.map.width + tx;
    const s = this.structures.get(i);
    const tile = this.map.get(tx, ty);
    if (!s || (tile !== 'seeds' && tile !== 'sprout')) {
      return false;
    }
    if (this.clock.now < (s.readyAt ?? 0)) {
      return 'wait';
    }
    if (tile === 'seeds') {
      this.map.set(tx, ty, 'sprout');
      s.readyAt = this.clock.now + GROW_SECONDS;
    } else {
      this.structures.delete(i);
      this.map.set(tx, ty, 'pumpkin');
    }
    return true;
  }
}
