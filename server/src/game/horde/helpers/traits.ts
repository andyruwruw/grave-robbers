// Packages
import { armedChance, armorChance, plateShare } from '@halloween/shared/difficulty/horde-scaling';
import { JUNK_WEAPONS } from '@halloween/shared/gear/defs/junk-weapons';
import { isShambler, isZombie } from '@halloween/shared/monsters/monster-kinds';

// Local Imports
import { ZOMBIE_LURES } from '../config/heat';

// Types
import type { MonsterKind } from '@halloween/shared/monsters/monster-kinds';
import type { MonsterTraits } from '../types/monster';

/**
 * Rolls a new monster's random traits, always in the same order: facing,
 * junk weapon, armor, lure, pace.
 * @param kind What it is.
 * @param level The world level.
 * @returns Its traits.
 */
export function rollTraits(kind: MonsterKind, level: number): MonsterTraits {
  const walker = isZombie(kind);
  return {
    facing: Math.random() * Math.PI * 2,
    held: walker && Math.random() < armedChance(level) ? JUNK_WEAPONS[Math.floor(Math.random() * JUNK_WEAPONS.length)] : null,
    armor: !walker || Math.random() >= armorChance(level) ? null : Math.random() < plateShare(level) ? 'plate' : 'helmet',
    lure: !isShambler(kind) ? null : Math.random() < ZOMBIE_LURES.players ? 'players' : Math.random() < ZOMBIE_LURES.graves / (1 - ZOMBIE_LURES.players) ? 'graves' : null,
    pace: 0.8 + Math.random() * 0.4,
  };
}
