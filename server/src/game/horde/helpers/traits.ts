// Packages
import { armedChance, armorChance, craftedShare, plateShare } from '@halloween/shared/difficulty/horde-scaling';
import { JUNK_WEAPONS } from '@halloween/shared/gear/defs/junk-weapons';
import { ZOMBIE_WEAPON_TIERS } from '@halloween/shared/monsters/kinds/zombie';
import { isShambler, isZombie } from '@halloween/shared/monsters/monster-kinds';

// Local Imports
import { ZOMBIE_LURES } from '../config/heat';

// Types
import type { GearKind } from '@halloween/shared/gear/types/gear-def';
import type { MonsterKind } from '@halloween/shared/monsters/monster-kinds';
import type { MonsterTraits } from '../types/monster';

/**
 * Rolls a new monster's random traits, always in the same order: facing,
 * weapon, armor, lure, pace.
 * @param kind What it is.
 * @param level The world level.
 * @returns Its traits.
 */
export function rollTraits(kind: MonsterKind, level: number): MonsterTraits {
  const walker = isZombie(kind);
  return {
    facing: Math.random() * Math.PI * 2,
    held: walker && Math.random() < armedChance(level) ? rollWeapon(level) : null,
    armor: !walker || Math.random() >= armorChance(level) ? null : Math.random() < plateShare(level) ? 'plate' : 'helmet',
    lure: !isShambler(kind) ? null : Math.random() < ZOMBIE_LURES.players ? 'players' : Math.random() < ZOMBIE_LURES.graves / (1 - ZOMBIE_LURES.players) ? 'graves' : null,
    pace: 0.8 + Math.random() * 0.4,
  };
}

/**
 * What an armed zombie or brute carries: now and then, at a high enough
 * world level, a craftable weapon from any tier it has reached, else junk.
 * @param level The world level.
 * @returns The weapon.
 */
function rollWeapon(level: number): GearKind {
  const crafted = ZOMBIE_WEAPON_TIERS.filter((t): boolean => level >= t.from).flatMap((t): GearKind[] => t.weapons);
  const pool = crafted.length > 0 && Math.random() < craftedShare(level) ? crafted : JUNK_WEAPONS;
  return pool[Math.floor(Math.random() * pool.length)];
}
