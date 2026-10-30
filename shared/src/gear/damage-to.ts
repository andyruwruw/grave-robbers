// Local Imports
import { GHOST_DAMAGE } from '../monsters/kinds/ghost';

// Types
import type { MonsterKind } from '../monsters/monster-kinds';
import type { WeaponStats } from './types/weapon-stats';

/**
 * How much of a blood weapon's damage a vampire takes.
 */
export const VAMPIRE_BLOOD_RESIST = 0.25;

/**
 * What a weapon (or its shot) does to a monster: everything to what it
 * slays, extra to vampires if it's holy, and little to vampires if it runs
 * on blood.
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
    return weapon.blessed ? amount : Math.max(1, Math.round(amount * GHOST_DAMAGE));
  }
  if (weapon.blessed && (kind === 'vampire' || kind === 'witch')) {
    amount *= weapon.blessed;
  }
  if (kind !== 'vampire') {
    return amount;
  }
  if (weapon.holy) {
    return amount * weapon.holy;
  }
  return weapon.ammo === 'blood' || weapon.hpCost ? amount * VAMPIRE_BLOOD_RESIST : amount;
}
