// Packages
import { Mesh } from 'three';

// Local Imports
import { GroundDrop } from './ground-drop';

// Types
import type { Group } from 'three';
import type { ItemState } from '@halloween/shared/goods/ground-items';

/**
 * A stack of structures someone dropped: a small strapped wooden crate
 * with the same glint as gear, since it's picked up with Grab too.
 */
export class CrateDrop extends GroundDrop {
  /**
   * Builds the crate.
   * @param item The item on the ground (holding structures).
   * @returns The drop's group.
   */
  build(item: ItemState): Group {
    const pile = this.place(item);
    pile.rotation.y = (item.id * 2.39996) % (Math.PI * 2);
    const crate = new Mesh(this._unitBox, this._ctx.materials.wood);
    crate.scale.set(0.34, 0.22, 0.28);
    crate.position.y = 0.11;
    crate.castShadow = true;
    pile.add(crate);
    for (const dx of [-0.1, 0.1]) {
      const strap = new Mesh(this._unitBox, this._ctx.materials.bolts);
      strap.scale.set(0.04, 0.23, 0.29);
      strap.position.set(dx, 0.11, 0);
      pile.add(strap);
    }
    this.addGlint(pile, item, 0.1, 0.26, 0);
    return pile;
  }
}
