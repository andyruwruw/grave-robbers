// Local Imports
import { CURSE_CHANCE_CAP } from '../config/essences';
import { ESSENCE_PACKAGES } from '../config/essence-packages';
import { variantOf } from './infusion-paths';

// Types
import type { GearKind } from '../../types/gear-def';
import type { Infusion } from '../../types/infusion';
import type { WeaponStats } from '../../types/weapon-stats';
import type { EssencePackage } from '../types/essence-package';
import type { VariantTwist } from '../types/variant';

/**
 * Rounds a stat to hundredths, as the phone shows them.
 *
 * @param n The value.
 * @returns It rounded.
 */
const hundredths = (n: number): number => Math.round(n * 100) / 100;

/**
 * A weapon's cycle: seconds from one hit (or shot) to the next, counting
 * the cooldown, a bow's draw, a crossbow's aim, and its share of a reload.
 *
 * @param stats The weapon's stats.
 * @returns Seconds per hit.
 */
export const swingCycle = (stats: WeaponStats): number =>
  stats.cooldown + (stats.draw ?? 0) + (stats.sight ?? 0) + (stats.reload ? stats.reload / (stats.burst ?? 1) : 0);

/**
 * A hex curse's chance per hit: its chance per second of the weapon's
 * cycle times the cycle, so fast and slow weapons curse about equally
 * often (at most CURSE_CHANCE_CAP).
 *
 * @param perCycleSecond The chance per second of cycle.
 * @param stats The weapon's stats.
 * @returns The chance per hit, 0 to CURSE_CHANCE_CAP.
 */
export const curseChance = (perCycleSecond: number, stats: WeaponStats): number =>
  hundredths(Math.min(CURSE_CHANCE_CAP, perCycleSecond * swingCycle(stats)));

/**
 * Adds an essence package to a weapon's stats, in place.
 *
 * @param stats The stats being built.
 * @param pkg The package.
 */
const applyPackage = (stats: WeaponStats, pkg: EssencePackage): void => {
  if (pkg.damage) {
    stats.damage = hundredths(stats.damage * pkg.damage);
  }
  if (pkg.knockback) {
    stats.knockback = hundredths(stats.knockback * pkg.knockback);
  }
  if (pkg.stun) {
    stats.stun = hundredths(Math.min(1, (stats.stun ?? 0) + pkg.stun));
  }
  if (pkg.haste) {
    const haste = pkg.haste;
    stats.cooldown = hundredths(stats.cooldown / haste);
    for (const key of ['windup', 'reload', 'draw'] as const) {
      const value = stats[key];
      if (value !== undefined) {
        stats[key] = hundredths(value / haste);
      }
    }
  }
  if (pkg.bane) {
    stats.bane = { ...stats.bane, ...pkg.bane };
  }
  if (pkg.blessing) {
    stats.blessing = pkg.blessing;
  }
  if (pkg.ghostMult) {
    stats.ghostMult = pkg.ghostMult;
    stats.ghostKnock = pkg.ghostKnock;
  }
  if (pkg.burn) {
    stats.burn = { ...pkg.burn };
  }
  if (pkg.curse) {
    const { perCycleSecond, ...curse } = pkg.curse;
    stats.curse = { ...curse, chance: curseChance(perCycleSecond, stats) };
  }
};

/**
 * Sets a variant's twist over a weapon's stats, in place: plain values
 * and arrays replace what's there, other objects are merged into it.
 *
 * @param stats The stats being built.
 * @param twist The twist.
 */
const applyTwist = (stats: WeaponStats, twist: VariantTwist): void => {
  const target = stats as unknown as Record<string, unknown>;
  for (const [key, value] of Object.entries(twist)) {
    const old = target[key];
    const merge = value !== null && typeof value === 'object' && !Array.isArray(value) && old !== null && typeof old === 'object';
    target[key] = merge ? { ...old, ...value } : value;
  }
};

/**
 * Adds an infusion to a weapon's stats, in place, after its skill tree
 * perk: its essence's package at its level (unless the variant replaces
 * it), then the variant's twist. Nothing changes for no infusion, or one
 * the kind has no variant for.
 *
 * @param stats The stats being built (a copy of the base, already upgraded).
 * @param kind The weapon.
 * @param infusion Its infusion, if any.
 */
export const applyInfusion = (stats: WeaponStats, kind: GearKind, infusion: Infusion | null | undefined): void => {
  const variant = variantOf(kind, infusion);
  if (!variant || !infusion) {
    return;
  }
  const pkg = ESSENCE_PACKAGES[infusion.essence]?.[infusion.level - 1];
  if (pkg && !variant.replacesPackage) {
    applyPackage(stats, pkg);
  }
  applyTwist(stats, variant.twist);
};
