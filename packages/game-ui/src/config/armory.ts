// Packages
import { GEAR, GEAR_KINDS } from '@halloween/shared/gear/gear-catalog';
import { pathsFor } from '@halloween/shared/gear/infusions/helpers/infusion-paths';

// Types
import type { GearKind } from '@halloween/shared/gear/types/gear-def';

/**
 * The weapons the Armory lists, in Craft list order: every kind with an
 * infusion path (the plain hammer stands for the infused hammer it makes;
 * the infused hammer itself is never listed).
 */
export const ARMORY_KINDS: GearKind[] = GEAR_KINDS.filter((k: GearKind): boolean => !GEAR[k].infused && pathsFor(k).length > 0);

/**
 * The selected variant's turning model, in CSS pixels.
 */
export const ARMORY_PREVIEW_PX = 104;

/**
 * Each weapon's icon in the Armory grid, in CSS pixels.
 */
export const ARMORY_TILE_PX = 34;

/**
 * Each level's still model on its card, in CSS pixels.
 */
export const ARMORY_LEVEL_PX = 36;

/**
 * How long (ms) a first press of Infuse waits for the second that
 * confirms it.
 */
export const INFUSE_CONFIRM_MS = 3000;
