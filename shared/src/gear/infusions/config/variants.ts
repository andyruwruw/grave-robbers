// Local Imports
import { HEAVY_VARIANTS } from './heavy-variants';
import { MELEE_VARIANTS } from './melee-variants';
import { RANGED_VARIANTS } from './ranged-variants';

// Types
import type { GearKind } from '../../types/gear-def';
import type { WeaponPaths } from '../types/variant';

/**
 * Every infusable kind's paths (see `docs/infusions.md`). The plain
 * hammer infuses into the infused hammer, so its paths are listed under
 * 'infused-hammer' (see `infusableKind`). The stake, junk, and armor have
 * none.
 */
export const VARIANTS: Partial<Record<GearKind, WeaponPaths>> = { ...MELEE_VARIANTS, ...HEAVY_VARIANTS, ...RANGED_VARIANTS };
