// Local Imports
import { clamp } from '../helpers/math';

// Types
import type { MonsterKind } from '../monsters/monster-kinds';

/**
 * What the world level does to the horde, given level `L`.
 */

/**
 * Extra monsters allowed per player on top of MONSTERS_PER_PLAYER (or the
 * blood moon's), and how much faster they trickle in.
 *
 * @param level The world level.
 * @returns Extra monsters allowed per player.
 */
export function extraPerPlayer(level: number): number {
  return level * 0.2;
}

/**
 * How many times as fast monsters trickle in at a world level.
 *
 * @param level The world level.
 * @returns The spawn rate multiplier.
 */
export function spawnSpeedup(level: number): number {
  return 1 + level * 0.04;
}

/**
 * Relative chance of each kind from the trickle spawner: vampires grow
 * more common, and new kinds start turning up past a level each:
 * skeletons after 1, ghouls after 3, brutes after 3, witches after 5,
 * demons (rare) after 9.
 *
 * @param level The world level.
 * @returns Each kind's relative weight.
 */
export function spawnWeights(level: number): Record<MonsterKind, number> {
  return {
    zombie: 0.55,
    vampire: 0.3 * (1 + level * 0.04),
    ghost: 0,
    brute: clamp((level - 3) * 0.025, 0, 0.4),
    skeleton: clamp((level - 1) * 0.03, 0, 0.3),
    ghoul: clamp((level - 3) * 0.03, 0, 0.3),
    witch: clamp((level - 5) * 0.02, 0, 0.2),
    demon: clamp((level - 9) * 0.01, 0, 0.08),
  };
}

/**
 * Chance a zombie or brute carries junk (biting harder with it).
 *
 * @param level The world level.
 * @returns The chance, 0 to 0.5.
 */
export function armedChance(level: number): number {
  return clamp(0.12 + level * 0.02, 0, 0.5);
}

/**
 * Chance a zombie or brute wears armor (from level 3), and of that, the
 * chance it's a plate rather than a helmet (from level 9).
 *
 * @param level The world level.
 * @returns The chance, 0 to 0.6.
 */
export function armorChance(level: number): number {
  return clamp((level - 2) * 0.04, 0, 0.6);
}

/**
 * Of armored zombies and brutes, the share wearing a plate rather than a
 * helmet.
 *
 * @param level The world level.
 * @returns The share, 0 to 0.6.
 */
export function plateShare(level: number): number {
  return clamp((level - 8) * 0.05, 0, 0.6);
}

/**
 * Health and damage multipliers for monsters spawned at a level, and the
 * matching bonus to the blood they leave.
 *
 * @param level The world level.
 * @returns The health multiplier.
 */
export function monsterHealth(level: number): number {
  return 1 + level * 0.04;
}

/**
 * Damage multiplier for monsters spawned at a world level.
 *
 * @param level The world level.
 * @returns The damage multiplier.
 */
export function monsterDamage(level: number): number {
  return 1 + level * 0.03;
}

/**
 * Blood multiplier for monsters spawned at a world level.
 *
 * @param level The world level.
 * @returns The blood multiplier.
 */
export function monsterReward(level: number): number {
  return 1 + level * 0.05;
}
