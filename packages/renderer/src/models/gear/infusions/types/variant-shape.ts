// Types
import type { GearKind } from '@halloween/shared/gear/types/gear-def';
import type { Essence, InfusionLevel } from '@halloween/shared/gear/types/infusion';
import type { VariantDecor } from '../variant-decor';

/**
 * Names one variant's model: its kind, essence, and level, as in
 * `short-sword@ecto2` (see `variantId`).
 */
export type VariantId = `${GearKind}@${Essence}${InfusionLevel}`;

/**
 * One variant's own twist on its model, run after its essence's look (see
 * `VARIANT_SHAPES`).
 * @param decor The model being decorated, its head, and what adds to it.
 */
export type VariantShape = (decor: VariantDecor) => void;

/**
 * What a palette color turns into on an infused model.
 */
export interface Restyle {
  /**
   * The new color.
   */
  color: string;

  /**
   * Whether it glows (unlit); left out, it keeps the box's own.
   */
  glow?: boolean;

  /**
   * How opaque it is; left out, it keeps the box's own.
   */
  opacity?: number;
}

/**
 * Palette colors (as the builders pass them) and what each turns into.
 */
export type ColorRemap = Record<string, Restyle>;
