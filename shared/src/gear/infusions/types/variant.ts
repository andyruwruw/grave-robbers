// Types
import type { Bundle } from '../../../goods/goods';
import type { Essence } from '../../types/infusion';
import type { WeaponStats } from '../../types/weapon-stats';

/**
 * A variant's changes to a weapon's stats: any `WeaponStats` field, set
 * over the stats after the essence package. An object field (other than
 * an array) is merged into the one already there, so a twist can add to
 * the package's `burn` or `bane` without repeating it.
 */
export type VariantTwist = {
  [K in keyof WeaponStats]?: NonNullable<WeaponStats[K]> extends readonly unknown[]
    ? WeaponStats[K]
    : NonNullable<WeaponStats[K]> extends object ? Partial<NonNullable<WeaponStats[K]>> : WeaponStats[K];
};

/**
 * One level of one weapon's infusion path: a named variant (see
 * `docs/infusions.md`).
 */
export interface Variant {
  /**
   * Its name, shown in place of the weapon's.
   */
  name: string;

  /**
   * One line on what it does, for the phone.
   */
  blurb: string;

  /**
   * The prefix shown under its name, when not its essence's own (see
   * `ESSENCE_PREFIX`).
   */
  prefix?: string;

  /**
   * What it costs, when not its essence's standard cost (see
   * `ESSENCE_COSTS`); before the anvil's discount.
   */
  cost?: Bundle;

  /**
   * It skips its essence's package (only its twist applies).
   */
  replacesPackage?: boolean;

  /**
   * What it changes on top of the package. For the torch and shield,
   * which have no weapon stats, only `lightMult` and `reflect` mean
   * anything; read them through `variantOf`.
   */
  twist: VariantTwist;
}

/**
 * One path's variants, level 1 first (the torch and shield have only
 * level 1).
 */
export type VariantPath = [Variant] | [Variant, Variant];

/**
 * A weapon's paths: each essence it can be infused with, and its
 * variants.
 */
export type WeaponPaths = Partial<Record<Essence, VariantPath>>;
