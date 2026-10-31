// Packages
import { useState } from 'react';

// Local Imports
import { ARMORY_KINDS } from '../config/armory';
import { bestCarried } from '../helpers/armory';

// Types
import type { GearKind } from '@halloween/shared/gear/types/gear-def';
import type { Infusion } from '@halloween/shared/gear/types/infusion';
import type { Gear } from '@halloween/shared/inventory/bag-items';

/**
 * What `useArmorySelection` hands back.
 */
interface ArmorySelection {
  /**
   * The weapon picked in the grid.
   */
  kind: GearKind;

  /**
   * The level whose model and words show at the top (null for the plain
   * weapon).
   */
  preview: Infusion | null;

  /**
   * Picks a weapon, showing the best variant of it carried (or the plain
   * one).
   */
  select: (kind: GearKind) => void;

  /**
   * Shows a level at the top (null for the plain weapon).
   */
  setPreview: (preview: Infusion | null) => void;
}

/**
 * The weapon the Armory opens on: the one held, if it has paths, else
 * the hammer.
 *
 * @param gear - What's equipped and in the bag.
 * @returns The weapon, as the Armory lists it.
 */
const firstKind = (gear: Gear): GearKind => {
  const held = gear.equipped.weapon?.kind;
  const listed = held === 'infused-hammer' ? 'hammer' : held;
  return listed && ARMORY_KINDS.includes(listed) ? listed : ARMORY_KINDS[0];
};

/**
 * The Armory's picking: which weapon is open (the held one at first), and
 * which of its levels shows at the top.
 *
 * @param gear - What's equipped and in the bag.
 * @returns The selection and what changes it.
 */
export function useArmorySelection(gear: Gear): ArmorySelection {
  const [kind, setKind] = useState<GearKind>(() => firstKind(gear));
  const [preview, setPreview] = useState<Infusion | null>(() => bestCarried(gear, firstKind(gear)));

  /**
   * Picks a weapon.
   *
   * @param next - The weapon.
   */
  const select = (next: GearKind): void => {
    setKind(next);
    setPreview(bestCarried(gear, next));
  };

  return { kind, preview, select, setPreview };
}
