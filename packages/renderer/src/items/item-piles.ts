// Packages
import { Group } from 'three';
import { isBuildItem, isGearItem } from '@halloween/shared/inventory/bag-items';
import { itemKey } from '@halloween/shared/inventory/item-keys';
import { GOODS } from '@halloween/shared/goods/goods';

// Local Imports
import { toWorld } from '../space/world-coords';
import { CrateDrop } from './drops/crate-drop';
import { GearDrop } from './drops/gear-drop';
import { ResourcePile } from './drops/resource-pile';
import { PileAnimations } from './pile-animations';
import { PileMaterials } from './pile-materials';

// Types
import type { Goods } from '@halloween/shared/goods/goods';
import type { ItemState } from '@halloween/shared/goods/ground-items';
import type { DropContext } from './drops/ground-drop';

/**
 * Things on the ground: resource piles (crisscrossed logs, a neat stack of
 * boards, grey chunks of stone, iron ingots, wrapped candies, a bundle of
 * bolts, pale bones and a skull, silver nuggets, bloodsteel ingots, green
 * tonic bottles, sized by how much they hold), single pieces of gear
 * laid flat with a twinkling glint, and crates of dropped structures. A
 * pile is only rebuilt when its contents change.
 */
export class ItemPiles {
  /**
   * Every drop on the ground.
   */
  readonly group = new Group();

  /**
   * The materials every drop shares.
   */
  private _materials = new PileMaterials();

  /**
   * The drops' glints and bobbing blood drops.
   */
  private _animations = new PileAnimations();

  /**
   * Each item's drop and the contents it was built for, by item id.
   */
  private _piles = new Map<number, { pile: Group; key: string }>();

  /**
   * Builds pieces of gear on the ground.
   */
  private _gears: GearDrop;

  /**
   * Builds crates of dropped structures.
   */
  private _crates: CrateDrop;

  /**
   * Builds resource piles.
   */
  private _resources: ResourcePile;

  /**
   * Starts with nothing on the ground.
   * @param _groundHeight Ground height at a tile-space point, so piles
   *   dropped on a hill sit on top of it.
   */
  constructor(private _groundHeight: (x: number, y: number) => number) {
    const ctx: DropContext = { materials: this._materials, animations: this._animations, groundHeight: _groundHeight };
    this._gears = new GearDrop(ctx);
    this._crates = new CrateDrop(ctx);
    this._resources = new ResourcePile(ctx);
  }

  /**
   * Shows every item on the ground, rebuilding only the drops whose
   * contents changed and removing the ones gone.
   * @param items Every item on the ground.
   */
  set(items: ItemState[]): void {
    const seen = new Set<number>();
    for (const item of items) {
      seen.add(item.id);
      const key = item.held ? itemKey(item.held) : GOODS.map((g: Goods): number => item[g]).join(':');
      const existing = this._piles.get(item.id);
      if (existing?.key === key) {
        const { x, z } = toWorld(item.x, item.y);
        existing.pile.position.set(x, this._groundHeight(item.x, item.y), z);
        continue;
      }
      if (existing) {
        this.removePile(existing.pile);
      }
      const pile = item.held && isBuildItem(item.held) ? this._crates.build(item) : item.held && isGearItem(item.held) ? this._gears.build(item) : this._resources.build(item);
      this.group.add(pile);
      this._piles.set(item.id, { pile, key });
    }
    for (const [id, { pile }] of this._piles) {
      if (!seen.has(id)) {
        this.removePile(pile);
        this._piles.delete(id);
      }
    }
  }

  /**
   * Twinkles the glints over gear and bobs the drops over blood, each on
   * its own beat.
   * @param time Seconds since the renderer started.
   */
  update(time: number): void {
    this._animations.update(time);
  }

  /**
   * Frees every material.
   */
  dispose(): void {
    this._materials.dispose();
    this._animations.dispose();
  }

  /**
   * Takes a drop off the ground and stops animating it.
   * @param pile The drop.
   */
  private removePile(pile: Group): void {
    this.group.remove(pile);
    this._animations.forget(pile);
  }
}
