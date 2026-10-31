// Local Imports
import { ESSENCE_LOOKS } from './config/essence-looks';
import { remapBox } from './helpers/remap-box';
import { variantId } from './helpers/variant-id';
import { VARIANT_SHAPES } from './shapes/variant-shapes';
import { VariantDecor } from './variant-decor';

// Types
import type { GearKind } from '@halloween/shared/gear/types/gear-def';
import type { Infusion } from '@halloween/shared/gear/types/infusion';
import type { BoxFactory, GearBuilder, GearModel } from '../../../types/models';

/**
 * Builds an infused model: the plain builder in the essence's colors, then
 * the essence's look for its level (see `EssenceLook`), then the variant's
 * own twist (`VARIANT_SHAPES`).
 * @param kind The gear.
 * @param infusion Its infusion.
 * @param box Makes each box.
 * @param build The plain model's builder.
 * @returns The model, with `animate` when anything on it moves.
 */
export function infuseModel(kind: GearKind, infusion: Infusion, box: BoxFactory, build: GearBuilder): GearModel {
  const look = ESSENCE_LOOKS[infusion.essence];
  const decor = new VariantDecor(build(remapBox(box, look.remap(infusion.level))), box, kind, infusion);
  look.decorate(decor, infusion.level);
  VARIANT_SHAPES[variantId(kind, infusion)]?.(decor);
  return decor.finish();
}
