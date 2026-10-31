// Local Imports
import { BLADE_SHAPES } from './blade-shapes';
import { BLUNT_SHAPES } from './blunt-shapes';
import { HEAVY_SHAPES } from './heavy-shapes';
import { MELEE_SHAPES } from './melee-shapes';
import { POLEARM_SHAPES } from './polearm-shapes';
import { RANGED_SHAPES } from './ranged-shapes';

// Types
import type { VariantId, VariantShape } from '../types/variant-shape';

/**
 * Every variant's own twist on its model, run after its essence's look
 * (see `infuseModel`), merged from the melee, heavy, and ranged files
 * (the same split as the shared `VARIANTS`).
 */
export const VARIANT_SHAPES: Partial<Record<VariantId, VariantShape>> = { ...MELEE_SHAPES, ...HEAVY_SHAPES, ...RANGED_SHAPES, ...BLADE_SHAPES, ...BLUNT_SHAPES, ...POLEARM_SHAPES };
