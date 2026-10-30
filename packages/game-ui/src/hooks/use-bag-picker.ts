// Packages
import { useEffect, useState } from 'react';
import { GEAR } from '@halloween/shared/gear/gear-catalog';
import { isBuildItem, isGearItem, isMaterialItem } from '@halloween/shared/inventory/bag-items';

// Local Imports
import { itemAt } from '../helpers/bag';

// Types
import type { GearSlot } from '@halloween/shared/gear/types/gear-def';
import type { BagItem, Gear } from '@halloween/shared/inventory/bag-items';
import type { Picked, SlotTone, SlotWhere } from '../types/bag';

/**
 * What the bag does when a slot is used, moved, or dropped.
 */
export interface BagActions {
  /**
   * Equips the gear in a bag slot.
   */
  onEquip: (bag: number) => void;

  /**
   * Drinks a tonic from a bag slot.
   */
  onDrink: (bag: number) => void;

  /**
   * Moves an equipped item back into the bag.
   */
  onUnequip: (slot: GearSlot) => void;

  /**
   * Moves an item to another slot (stacking or swapping).
   */
  onMove: (from: SlotWhere, to: SlotWhere) => void;

  /**
   * Throws an item (bag index or equipped slot) onto the facing tile.
   */
  onDropItem: (from: SlotWhere) => void;

  /**
   * Starts building from a stack of structures.
   */
  onPlace: (bag: number) => void;
}

/**
 * What `useBagPicker` hands back.
 */
interface BagPicker {
  /**
   * What's picked up, or null.
   */
  picked: Picked | null;

  /**
   * Handles a tap on a slot.
   */
  tapSlot: (where: SlotWhere) => void;

  /**
   * Throws what's picked up onto the facing tile.
   */
  drop: () => void;

  /**
   * How a slot is drawn.
   */
  tone: (where: SlotWhere, item: BagItem | null) => SlotTone;
}

/**
 * Picking things up in the bag: tap to pick up, tap another slot to move it
 * there, tap it again to use it. Tapping a stack of structures builds it.
 *
 * @param gear - What's equipped and in the bag.
 * @param tapped - Whether the last press was a tap rather than a hold.
 * @param actions - What the bag does.
 * @returns What's picked up and the slot handlers.
 */
export function useBagPicker(gear: Gear, tapped: () => boolean, actions: BagActions): BagPicker {
  const { onEquip, onDrink, onUnequip, onMove, onDropItem, onPlace } = actions;
  const [picked, setPicked] = useState<Picked | null>(null);
  const pickedItem = picked ? itemAt(gear, picked.from) : null;

  useEffect(() => {
    if (picked && !pickedItem) {
      setPicked(null);
    }
  }, [picked, pickedItem]);

  /**
   * Uses an item where it is: puts equipped gear away, builds structures,
   * drinks tonic, or equips gear.
   *
   * @param where - Its slot.
   * @param item - The item.
   */
  const use = (where: SlotWhere, item: BagItem): void => {
    if (typeof where === 'string') {
      onUnequip(where);
    } else if (isBuildItem(item)) {
      onPlace(where);
    } else if (isMaterialItem(item) && item.material === 'tonic') {
      onDrink(where);
    } else if (isGearItem(item)) {
      onEquip(where);
    }
  };

  /**
   * Picks up, moves, uses, or builds from a slot.
   *
   * @param where - The slot tapped.
   */
  const tapSlot = (where: SlotWhere): void => {
    if (!tapped()) {
      return;
    }
    const item = itemAt(gear, where);
    if (typeof where === 'number' && item && isBuildItem(item) && !(picked && picked.from !== where)) {
      setPicked(null);
      onPlace(where);
      return;
    }
    if (picked) {
      if (picked.from === where) {
        if (item) {
          use(where, item);
        }
      } else {
        onMove(picked.from, where);
      }
      setPicked(null);
      return;
    }
    setPicked(item ? { from: where } : null);
  };

  /**
   * Throws what's picked up.
   */
  const drop = (): void => {
    if (!picked) {
      return;
    }
    onDropItem(picked.from);
    setPicked(null);
  };

  /**
   * How a slot is drawn: picked up, equipped, a place the picked gear can
   * go, or plain.
   *
   * @param where - The slot.
   * @param item - What's in it.
   * @returns Its tone.
   */
  const tone = (where: SlotWhere, item: BagItem | null): SlotTone => {
    if (picked && picked.from === where) {
      return 'picked';
    }
    if (typeof where === 'string' && item) {
      return 'equipped';
    }
    const held = picked ? itemAt(gear, picked.from) : null;
    return typeof where === 'string' && held && isGearItem(held) && GEAR[held.kind].slot === where ? 'target' : 'plain';
  };

  return { picked, tapSlot, drop, tone };
}
