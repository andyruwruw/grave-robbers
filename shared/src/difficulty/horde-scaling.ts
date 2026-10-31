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
 * The trickle spawner's mix at set world levels, in percent of spawns
 * (ghosts come on their own clock). Between two levels it blends in a
 * straight line; past the last it holds.
 */
export const SPAWN_MIX: { level: number; mix: Partial<Record<MonsterKind, number>> }[] = [
  { level: 0, mix: { zombie: 60, vampire: 15, skeleton: 25 } },
  { level: 4, mix: { zombie: 50, vampire: 15, skeleton: 20, brute: 5, ghoul: 10 } },
  { level: 8, mix: { zombie: 49, vampire: 10, skeleton: 13, brute: 5, ghoul: 15, witch: 5, bloater: 3 } },
  { level: 10, mix: { zombie: 45, vampire: 10, skeleton: 12, brute: 5, ghoul: 15, witch: 8, demon: 1, bloater: 4 } },
  { level: 15, mix: { zombie: 42, vampire: 10, skeleton: 10, brute: 5, ghoul: 15, witch: 10, demon: 3, bloater: 4, necromancer: 1 } },
  { level: 20, mix: { zombie: 40, vampire: 10, skeleton: 8, brute: 5, ghoul: 15, witch: 10, demon: 4, bloater: 5, necromancer: 3 } },
];

/**
 * Relative chance of each kind from the trickle spawner: SPAWN_MIX blended
 * between the set levels either side of this one, plus what world events
 * add (a blood moon's werewolves, see `EventModifiers.spawnMix`).
 *
 * @param level The world level.
 * @param extra Weight world events add to some kinds.
 * @returns Each kind's relative weight.
 */
export function spawnWeights(level: number, extra: Partial<Record<MonsterKind, number>> = {}): Record<MonsterKind, number> {
  const next = SPAWN_MIX.findIndex((m: { level: number }): boolean => m.level > level);
  const hi = SPAWN_MIX[next < 0 ? SPAWN_MIX.length - 1 : next];
  const lo = SPAWN_MIX[next < 0 ? SPAWN_MIX.length - 1 : Math.max(0, next - 1)];
  const t = hi.level > lo.level ? clamp((level - lo.level) / (hi.level - lo.level), 0, 1) : 0;
  const share = (k: MonsterKind): number => (lo.mix[k] ?? 0) + ((hi.mix[k] ?? 0) - (lo.mix[k] ?? 0)) * t + (extra[k] ?? 0);
  return {
    zombie: share('zombie'),
    vampire: share('vampire'),
    ghost: 0,
    brute: share('brute'),
    skeleton: share('skeleton'),
    ghoul: share('ghoul'),
    witch: share('witch'),
    demon: share('demon'),
    bloater: share('bloater'),
    necromancer: share('necromancer'),
    werewolf: share('werewolf'),
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
 * Share of armed zombies and brutes whose weapon is a real, craftable one
 * (see ZOMBIE_WEAPON_TIERS) rather than junk.
 *
 * @param level The world level.
 * @returns The share, 0 to 0.4.
 */
export function craftedShare(level: number): number {
  return clamp((level - 7) * 0.03, 0, 0.4);
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
