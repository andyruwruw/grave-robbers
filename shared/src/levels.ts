// Local Imports
import { GEAR, WOOD_AXE, isGearItem } from './gear';
import { TREE, TREE_NODE, levelOf, weaponStats } from './tree';

// Types
import type { BagItem, Gear, GearItem, GearKind, WeaponStats } from './gear';
import type { MonsterKind } from './monsters';
import type { NodeId, TreeState } from './tree';

/**
 * Hidden levels. Each player has one, from how hard they hit, how much
 * they can take, how far up the skill tree they are, and how long they've
 * played; the world's level follows the players online and sets how many
 * monsters come, which kinds, and how tough they are. Never shown on
 * phones.
 */

/**
 * Levels gained each time a player's best damage per second (or how much
 * damage they can take) doubles over the wood axe and bare skin.
 */
export const LEVELS_PER_DOUBLING = 5;

/**
 * Ranged weapons count for more (they hit from safety); weapons that cost
 * health to swing count for less.
 */
const RANGED_BONUS = 1.3;
const BLOOD_PRICE = 0.7;

/**
 * A shield only guards the front, and only while it's held up, so it
 * counts for this share of its guard.
 */
const SHIELD_SHARE = 0.3;

/**
 * Skill tree points per player level. A node is worth its depth in the
 * tree (1 for one known from the start, 2 for a blueprint, one more than
 * the node it grows from otherwise) per upgrade, plus its depth again for
 * a found blueprint.
 */
const TREE_POINTS_PER_LEVEL = 10;

/**
 * A player gains a level per this many seconds connected, up to
 * MAX_ONLINE_LEVELS. Time with no phone connected never counts.
 */
export const ONLINE_SECONDS_PER_LEVEL = 480;
const MAX_ONLINE_LEVELS = 8;

/**
 * The world level leans toward the strongest player online: this share
 * of theirs, the rest the average of everyone else's.
 */
const STRONGEST_SHARE = 0.7;

/**
 * Levels per second the world level climbs toward its target, and falls
 * when the target drops (a strong player leaves, say).
 */
export const WORLD_LEVEL_RISE = 1 / 15;
export const WORLD_LEVEL_FALL = 1 / 60;

/**
 * Most levels the TV's Game tab can add to the world level, and how many
 * each press adds or takes away.
 */
export const WORLD_LEVEL_BOOST_MAX = 60;
export const WORLD_LEVEL_BOOST_STEP = 5;

/**
 * How dangerous one weapon is, in damage per second, with its upgrades.
 */
export function weaponDps(stats: WeaponStats): number {
  let dps = stats.damage / stats.cooldown;
  if (stats.ranged) {
    dps *= RANGED_BONUS;
  }
  if (stats.hpCost) {
    dps *= BLOOD_PRICE;
  }
  return dps;
}

function depth(id: NodeId): number {
  const unlock = TREE_NODE[id].unlock;
  return unlock.by === 'start' ? 1 : unlock.by === 'blueprint' ? 2 : depth(unlock.from) + 1;
}

/**
 * What a player's level is made of.
 */
export interface PlayerLevel {
  offense: number;
  defense: number;
  tree: number;
  online: number;
  total: number;
}

/**
 * A player's hidden level from everything they own (equipped or in the
 * bag), their skill tree, and the seconds they've been connected.
 */
export function playerLevel(gear: Gear, tree: TreeState, onlineSeconds: number): PlayerLevel {
  const owned = [...Object.values(gear.equipped), ...gear.bag]
    .filter((item: BagItem | GearItem | null): item is GearItem => item !== null && isGearItem(item));
  const kinds = new Set(owned.map((item: GearItem): GearKind => item.kind));
  const dps = Math.max(weaponDps(WOOD_AXE), ...[...kinds].filter((k: GearKind): boolean => !!GEAR[k].weapon)
    .map((k: GearKind): number => weaponDps(weaponStats(k, tree))));
  const guard = (kind: GearKind, share: number): number => kinds.has(kind) ? 1 - (1 - GEAR[kind].guard! + 0.05 * levelOf(`gear:${kind}`, tree)) * share : 1;
  const armor = Math.min(1, ...[...kinds].filter((k: GearKind): boolean => GEAR[k].slot === 'armor').map((k: GearKind): number => guard(k, 1)));
  const toughness = 1 / (armor * guard('shield', SHIELD_SHARE));
  let points = 0;
  for (const node of TREE) {
    points += depth(node.id) * (levelOf(node.id, tree) + (tree.found.includes(node.id) ? 1 : 0));
  }
  const offense = Math.max(0, LEVELS_PER_DOUBLING * Math.log2(dps / weaponDps(WOOD_AXE)));
  const defense = Math.max(0, LEVELS_PER_DOUBLING * Math.log2(toughness));
  const fromTree = points / TREE_POINTS_PER_LEVEL;
  const online = Math.min(MAX_ONLINE_LEVELS, onlineSeconds / ONLINE_SECONDS_PER_LEVEL);
  return { offense, defense, tree: fromTree, online, total: offense + defense + fromTree + online };
}

/**
 * The level the world heads for, given the levels of everyone online:
 * mostly the strongest, partly the average of the rest. Null with nobody
 * online, so an idle server stays where it was.
 */
export function worldLevelTarget(levels: number[]): number | null {
  if (levels.length === 0) {
    return null;
  }
  const sorted = [...levels].sort((a: number, b: number): number => b - a);
  if (sorted.length === 1) {
    return sorted[0];
  }
  const rest = sorted.slice(1);
  return STRONGEST_SHARE * sorted[0] + (1 - STRONGEST_SHARE) * (rest.reduce((a: number, b: number): number => a + b, 0) / rest.length);
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

/**
 * What the world level does to the horde, given level `L`.
 */

/**
 * Extra monsters allowed per player on top of MONSTERS_PER_PLAYER (or the
 * blood moon's), and how much faster they trickle in.
 */
export function extraPerPlayer(level: number): number {
  return level * 0.2;
}

export function spawnSpeedup(level: number): number {
  return 1 + level * 0.04;
}

/**
 * Relative chance of each kind from the trickle spawner: vampires grow
 * more common, and new kinds start turning up past a level each:
 * skeletons after 1, ghouls after 3, brutes after 3, witches after 5,
 * demons (rare) after 9.
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
 */
export function armedChance(level: number): number {
  return clamp(0.12 + level * 0.02, 0, 0.5);
}

/**
 * What zombies and brutes wear: a helmet or a plate, each multiplying the
 * damage they take.
 */
export type MonsterArmor = 'helmet' | 'plate';

export const MONSTER_ARMOR_GUARD: Record<MonsterArmor, number> = { helmet: 0.75, plate: 0.55 };

/**
 * Chance an armored monster leaves a piece of iron when it dies.
 */
export const ARMOR_SCRAP: Record<MonsterArmor, number> = { helmet: 0.3, plate: 0.8 };

/**
 * Chance a zombie or brute wears armor (from level 3), and of that, the
 * chance it's a plate rather than a helmet (from level 9).
 */
export function armorChance(level: number): number {
  return clamp((level - 2) * 0.04, 0, 0.6);
}

export function plateShare(level: number): number {
  return clamp((level - 8) * 0.05, 0, 0.6);
}

/**
 * Health and damage multipliers for monsters spawned at a level, and the
 * matching bonus to the blood they leave.
 */
export function monsterHealth(level: number): number {
  return 1 + level * 0.04;
}

export function monsterDamage(level: number): number {
  return 1 + level * 0.03;
}

export function monsterReward(level: number): number {
  return 1 + level * 0.05;
}
