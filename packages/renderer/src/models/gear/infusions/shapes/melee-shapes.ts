// Types
import type { VariantId, VariantShape } from '../types/variant-shape';

/**
 * The melee weapons' own twists on their essence's look (infused hammer,
 * spear, short sword, ritual knife, scythe, battle axe, greatsword,
 * flail), by variant.
 */
export const MELEE_SHAPES: Partial<Record<VariantId, VariantShape>> = {};
