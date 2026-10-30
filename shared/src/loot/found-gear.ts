// Types
import type { MonsterKind } from '../monsters/monster-kinds';

/**
 * Chance a dying monster leaves a piece of gear.
 */
export const MONSTER_LOOT_CHANCE: Record<MonsterKind, number> = { zombie: 0, vampire: 0, ghost: 0, brute: 0, skeleton: 0, witch: 0, ghoul: 0, demon: 0 };

/**
 * Chance a smashed pumpkin turns out to have hidden a piece of gear. Gear
 * otherwise only comes from chests (and zombies' junk).
 */
export const PUMPKIN_LOOT_CHANCE = 0.04;

/**
 * Found gear (from chests, pumpkins, and zombies) is partly worn: at least
 * this much of a fresh one's use is left.
 */
export const LOOT_MIN_WEAR = 0.5;
