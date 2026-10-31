// Local Imports
import { GHOST_DAMAGE } from '../monsters/kinds/ghost';
import { BLESSED_CAP } from './infusions/config/essences';

// Types
import type { MonsterKind } from '../monsters/monster-kinds';
import type { WeaponStats } from './types/weapon-stats';

/**
 * How much of a blood weapon's damage a vampire takes.
 */
export const VAMPIRE_BLOOD_RESIST = 0.25;

/**
 * What a weapon's holiness multiplies its damage to a monster by: Blessed
 * (`blessed`) on vampires and witches, `holy` on vampires, and an
 * infusion's `blessing` on vampires and demons. With a `blessing` they
 * stack up to BLESSED_CAP in all.
 *
 * @param kind The monster hit.
 * @param weapon The weapon (or what it shot).
 * @returns The multiplier (1 for none).
 */
function holiness(kind: MonsterKind, weapon: WeaponStats): number {
  let mult = 1;
  if (weapon.blessed && (kind === 'vampire' || kind === 'witch')) {
    mult *= weapon.blessed;
  }
  if (weapon.holy && kind === 'vampire') {
    mult *= weapon.holy;
  }
  if (weapon.blessing && (kind === 'vampire' || kind === 'demon')) {
    mult = Math.min(BLESSED_CAP, mult * weapon.blessing);
  }
  return mult;
}

/**
 * What a weapon (or its shot) does to a monster: everything to what it
 * slays, a share to ghosts (all of it if blessed, more with ectoplasm),
 * extra to each kind it's a bane of, extra to vampires (and demons) if
 * it's holy, and little to vampires if it runs on blood.
 *
 * @param kind The monster hit.
 * @param weapon The weapon (or what it shot).
 * @param amount The hit's damage before this.
 * @returns The damage the monster takes (Infinity for what it slays).
 */
export function damageTo(kind: MonsterKind, weapon: WeaponStats, amount: number): number {
  if (weapon.slays === kind) {
    return Infinity;
  }
  if (kind === 'ghost') {
    if (weapon.ghostMult) {
      return amount * GHOST_DAMAGE * Math.max(weapon.ghostMult, weapon.blessed ? 1 / GHOST_DAMAGE : 0);
    }
    return weapon.blessed ? amount : Math.max(1, Math.round(amount * GHOST_DAMAGE));
  }
  amount *= (weapon.bane?.[kind] ?? 1) * holiness(kind, weapon);
  if (kind === 'vampire' && !weapon.holy && (weapon.ammo === 'blood' || weapon.hpCost)) {
    return amount * VAMPIRE_BLOOD_RESIST;
  }
  return amount;
}
