// Packages
import { twoHanded } from '@halloween/shared/gear/gear-catalog';

// Types
import type { GearKind } from '@halloween/shared/gear/types/gear-def';

/**
 * Whether a weapon and an off-hand piece can't be held together: a shield
 * beside any two-handed weapon, or a torch beside the infused hammer (it
 * takes both hands, see `docs/infusions.md`).
 * @param weapon The weapon's kind, if any.
 * @param offhand The off-hand piece's kind, if any.
 * @returns True when one of them has to go.
 */
export const handsClash = (weapon: GearKind | null | undefined, offhand: GearKind | null | undefined): boolean =>
  (offhand === 'shield' && twoHanded(weapon)) || (offhand === 'torch' && weapon === 'infused-hammer');
