// Local Imports
import { HAMMER } from '../gear/defs/melee-weapons';
import { GEAR } from '../gear/gear-catalog';
import { isGearItem } from '../inventory/bag-items';
import { TREE } from '../skill-tree/nodes';
import { levelOf, nodeDepth } from '../skill-tree/progress';
import { itemStats } from '../skill-tree/upgrades/gear-upgrades';

// Types
import type { GearKind } from '../gear/types/gear-def';
import type { WeaponStats } from '../gear/types/weapon-stats';
import type { BagItem, Gear, GearItem } from '../inventory/bag-items';
import type { TreeState } from '../skill-tree/types/skill-tree';

/**
 * Hidden levels. Each player has one, from how hard they hit, how much
 * they can take, how far up the skill tree they are, and how long they've
 * played; the world's level follows the players online and sets how many
 * monsters come, which kinds, and how tough they are. Never shown on
 * phones.
 */

/**
 * Levels gained each time a player's best damage per second (or how much
 * damage they can take) doubles over the hammer and bare skin.
 */
export const LEVELS_PER_DOUBLING = 5;

/**
 * Ranged weapons count for more (they hit from safety); weapons that cost
 * health to swing count for less.
 */
const RANGED_BONUS = 1.3;

/**
 * What weapons that cost health to swing count for.
 */
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

/**
 * Most levels time connected can give.
 */
const MAX_ONLINE_LEVELS = 8;

/**
 * How dangerous one weapon is, in damage per second, with its upgrades
 * and infusion.
 *
 * @param stats The weapon's upgraded stats.
 * @returns Its weighted damage per second.
 */
export function weaponDps(stats: WeaponStats): number {
  const cycle = stats.burst ? stats.burst * stats.cooldown + stats.reload! : stats.cooldown;
  let dps = (stats.damage * (stats.pellets ?? 1) * (stats.burst ?? 1)) / cycle;
  if (stats.ranged) {
    dps *= RANGED_BONUS;
  }
  if (stats.hpCost) {
    dps *= BLOOD_PRICE;
  }
  return dps;
}

/**
 * What a player's level is made of.
 */
export interface PlayerLevel {
  /**
   * Levels from the best weapon owned.
   */
  offense: number;

  /**
   * Levels from the best armor and shield owned.
   */
  defense: number;

  /**
   * Levels from skill tree progress.
   */
  tree: number;

  /**
   * Levels from time connected.
   */
  online: number;

  /**
   * All of them added up.
   */
  total: number;
}

/**
 * The damage per second offense levels count up from: what the hammer did
 * before it was weakened, so the horde's scaling didn't shift with it.
 */
const OFFENSE_BASE_DPS = 3 / 0.55;

/**
 * A player's hidden level from everything they own (equipped or in the
 * bag), their skill tree, and the seconds they've been connected.
 *
 * @param gear Their equipped gear and bag.
 * @param tree Their skill tree progress.
 * @param onlineSeconds Seconds they've been connected.
 * @returns Their level and what it's made of.
 */
export function playerLevel(gear: Gear, tree: TreeState, onlineSeconds: number): PlayerLevel {
  const owned = [...Object.values(gear.equipped), ...gear.bag]
    .filter((item: BagItem | GearItem | null): item is GearItem => item !== null && isGearItem(item));
  const kinds = new Set(owned.map((item: GearItem): GearKind => item.kind));
  const dps = Math.max(weaponDps(HAMMER), ...owned.filter((item: GearItem): boolean => !!GEAR[item.kind].weapon)
    .map((item: GearItem): number => weaponDps(itemStats(item, tree))));
  /**
   * The share of damage a piece of owned gear lets through, at its upgrade level.
   * @param kind The armor or shield.
   * @param share How much of the damage it covers.
   * @returns The fraction let through (1 when not owned).
   */
  const guard = (kind: GearKind, share: number): number => kinds.has(kind) ? 1 - (1 - GEAR[kind].guard! + 0.05 * levelOf(`gear:${kind}`, tree)) * share : 1;
  const armor = Math.min(1, ...[...kinds].filter((k: GearKind): boolean => GEAR[k].slot === 'armor').map((k: GearKind): number => guard(k, 1)));
  const toughness = 1 / (armor * guard('shield', SHIELD_SHARE));
  let points = 0;
  for (const node of TREE) {
    points += nodeDepth(node.id) * (levelOf(node.id, tree) + (tree.found.includes(node.id) ? 1 : 0));
  }
  const offense = Math.max(0, LEVELS_PER_DOUBLING * Math.log2(dps / OFFENSE_BASE_DPS));
  const defense = Math.max(0, LEVELS_PER_DOUBLING * Math.log2(toughness));
  const fromTree = points / TREE_POINTS_PER_LEVEL;
  const online = Math.min(MAX_ONLINE_LEVELS, onlineSeconds / ONLINE_SECONDS_PER_LEVEL);
  return { offense, defense, tree: fromTree, online, total: offense + defense + fromTree + online };
}
