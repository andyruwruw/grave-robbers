// Packages
import { bagCount, canAfford } from '@halloween/shared/inventory/affordability';
import { emptyGear, isGearItem } from '@halloween/shared/inventory/bag-items';
import { weaponStats } from '@halloween/shared/skill-tree/upgrades/gear-upgrades';

// Local Imports
import { emptyInventory } from '../helpers/inventory';
import { PlayerBody } from './player-body';

// Types
import type { WeaponStats } from '@halloween/shared/gear/types/weapon-stats';
import type { BagItem, Gear } from '@halloween/shared/inventory/bag-items';
import type { Bundle, Inventory, Material } from '@halloween/shared/goods/goods';
import type { GearKind, GearSlot } from '@halloween/shared/gear/types/gear-def';
import type { StructureKind } from '@halloween/shared/structures/types/structures';
import type { TreeState } from '@halloween/shared/skill-tree/types/skill-tree';
import type { PlayerInit } from '../types/players';

/**
 * What a player carries and works with: goods, the bag, their skill tree,
 * the light in hand, the build pick, and the stations in reach.
 */
export class PlayerKit extends PlayerBody {
  /**
   * Candy and blood.
   */
  inventory: Inventory;

  /**
   * The bag and what's equipped.
   */
  bag: Gear;

  /**
   * Their own skill tree, kept through death (not saved).
   */
  tree: TreeState;

  /**
   * Seconds their phone has been connected, toward their hidden level
   * (kept when they leave, like the tree).
   */
  onlineSeconds: number;

  /**
   * What's equipped in each slot, as broadcast.
   */
  gear: Record<GearSlot, GearKind | null> = { weapon: null, offhand: null, armor: null };

  /**
   * Radius of a carried light (a hand torch), or 0.
   */
  light = 0;

  /**
   * Structure picked from the bag to place, previewed on the facing tile.
   */
  building: StructureKind | null = null;

  /**
   * The point the mouse aims the build at, or null for the facing tile.
   */
  buildAim: { x: number; y: number } | null = null;

  /**
   * The way a turned structure will face (null: the player's facing).
   */
  buildFacing: number | null = null;

  /**
   * The bag slot whose structures are being placed, or null.
   */
  buildSlot: number | null = null;

  /**
   * What a research table in reach takes off upgrades (0 without one).
   */
  research = 0;

  /**
   * The level of the best anvil in reach (null without one), which late
   * gear and parts are crafted at.
   */
  anvil: number | null = null;

  /**
   * The storage chest this player has open on their phone, if any.
   */
  stashAt: { tx: number; ty: number } | null = null;

  /**
   * Sets up empty pockets, or what they kept from last time.
   * @param init Who they are, where they start, and what they kept.
   */
  constructor(init: PlayerInit) {
    super(init);
    this.inventory = init.back?.inventory ?? emptyInventory();
    this.bag = init.back?.bag ?? emptyGear();
    this.tree = init.back?.tree ?? { found: [], levels: {} };
    this.onlineSeconds = init.back?.onlineSeconds ?? 0;
  }

  /**
   * The equipped weapon's stats (the hammer's with none).
   * @returns Its stats at their tree's levels.
   */
  weapon(): WeaponStats {
    return weaponStats(this.bag.equipped.weapon?.kind ?? null, this.tree);
  }

  /**
   * The hammer's stats, which every job on a tile goes by.
   * @returns Its stats at their tree's levels.
   */
  hammer(): WeaponStats {
    return weaponStats('hammer', this.tree);
  }

  /**
   * How much of a material the bag holds.
   * @param material The material.
   * @returns The count over every stack.
   */
  count(material: Material): number {
    return bagCount(this.bag.bag, material);
  }

  /**
   * Whether they carry enough to cover a cost.
   * @param cost The cost.
   * @returns True if they can pay it.
   */
  canPay(cost: Bundle): boolean {
    return canAfford(cost, this.inventory, this.bag.bag);
  }

  /**
   * The first stake in the bag, when the weapon in hand isn't one.
   * @returns Its bag index, or -1.
   */
  spareStake(): number {
    return this.bag.equipped.weapon?.kind === 'stake' ? -1 : this.bag.bag.findIndex((item: BagItem | null): boolean => !!item && isGearItem(item) && item.kind === 'stake');
  }
}
