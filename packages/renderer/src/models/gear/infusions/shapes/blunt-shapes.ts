// Local Imports
import { FIST_SHAPES } from './blunt/fist-shapes';
import { FLAIL_SHAPES } from './blunt/flail-shapes';
import { HAMMER_SHAPES } from './blunt/hammer-shapes';
import { MOURNING_STAR_SHAPES } from './blunt/mourning-star-shapes';
import { STAFF_SHAPES } from './blunt/staff-shapes';

// Types
import type { VariantId, VariantShape } from '../types/variant-shape';

/**
 * The blunt weapons' own twists on their essence's look (infused hammer,
 * warhammer, flail, Mourning Star, holy quarterstaff, spiked gauntlet),
 * by variant.
 */
export const BLUNT_SHAPES: Partial<Record<VariantId, VariantShape>> = {
  ...HAMMER_SHAPES,
  ...FLAIL_SHAPES,
  ...MOURNING_STAR_SHAPES,
  ...STAFF_SHAPES,
  ...FIST_SHAPES,
};
