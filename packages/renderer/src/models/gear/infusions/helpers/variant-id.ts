// Types
import type { GearKind } from '@halloween/shared/gear/types/gear-def';
import type { Infusion } from '@halloween/shared/gear/types/infusion';
import type { VariantId } from '../types/variant-shape';

/**
 * Names a variant's model: `${kind}@${essence}${level}`.
 * @param kind The gear.
 * @param infusion Its infusion.
 * @returns The id.
 */
export const variantId = (kind: GearKind, infusion: Infusion): VariantId => `${kind}@${infusion.essence}${infusion.level}`;
