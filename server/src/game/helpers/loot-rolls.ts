// Packages
import { GEAR, GEAR_KINDS } from '@halloween/shared/gear/gear-catalog';
import { stock } from '@halloween/shared/goods/goods';
import { CHEST_LEVEL_CAP, CHEST_LOOT } from '@halloween/shared/loot/chests';
import {
  DIG_BONES,
  DIG_BONE_CHANCE,
  DIG_CANDY,
  DIG_STONE,
  DIG_STONE_CHANCE,
  DIG_WOOD,
  DIG_WOOD_CHANCE,
} from '@halloween/shared/loot/graves';
import { LOOT_MIN_WEAR } from '@halloween/shared/loot/found-gear';
import { gearWear } from '@halloween/shared/skill-tree/upgrades/gear-upgrades';

// Types
import type { Bundle } from '@halloween/shared/goods/goods';
import type { ChestLoot } from '@halloween/shared/loot/chests';
import type { GearKind } from '@halloween/shared/gear/types/gear-def';
import type { GearItem } from '@halloween/shared/inventory/bag-items';
import type { TreeState } from '@halloween/shared/skill-tree/types/skill-tree';

/**
 * A random, partly worn piece of gear, rarer kinds less often.
 * @param tree The skill tree its full wear goes by.
 * @returns The gear.
 */
export function randomLoot(tree: TreeState): GearItem {
  const total = GEAR_KINDS.reduce((sum: number, k: GearKind): number => sum + GEAR[k].loot, 0);
  let roll = Math.random() * total;
  const kind = GEAR_KINDS.find((k: GearKind): boolean => (roll -= GEAR[k].loot) < 0) ?? GEAR_KINDS[0];
  return { kind, wear: Math.ceil(gearWear(kind, tree) * (LOOT_MIN_WEAR + Math.random() * (1 - LOOT_MIN_WEAR))) };
}

/**
 * What a chest holds for an opener at this player level (counted at most
 * to CHEST_LEVEL_CAP): each line of CHEST_LOOT rolled on its own.
 * @param level The opener's player level.
 * @returns The goods.
 */
export function rollChest(level: number): Bundle {
  const l = Math.max(0, Math.min(CHEST_LEVEL_CAP, level));
  const goods = stock();
  for (const line of CHEST_LOOT) {
    if (Math.random() >= Math.min(line.maxChance, line.chance + line.chancePerLevel * l)) {
      continue;
    }
    goods[line.goods] += chestAmount(line, l);
  }
  return goods;
}

/**
 * How many of one chest line, its top end grown with the level.
 * @param line The line.
 * @param level The opener's player level, already capped.
 * @returns How many.
 */
function chestAmount(line: ChestLoot, level: number): number {
  const [least, most] = line.amount;
  const top = Math.min(line.maxAmount, most + (line.levelsPerExtra > 0 ? Math.floor(level / line.levelsPerExtra) : 0));
  return least + Math.floor(Math.random() * (top - least + 1));
}

/**
 * What digging up a grave turns up, by hand or by a bone digger: candy,
 * and maybe wood, bones, and headstone rubble (stone).
 * @returns The goods.
 */
export function rollGrave(): Bundle {
  const roll = ([least, most]: [number, number]): number => least + Math.floor(Math.random() * (most - least + 1));
  return stock({
    candy: roll(DIG_CANDY),
    wood: Math.random() < DIG_WOOD_CHANCE ? roll(DIG_WOOD) : 0,
    bone: Math.random() < DIG_BONE_CHANCE ? roll(DIG_BONES) : 0,
    stone: Math.random() < DIG_STONE_CHANCE ? roll(DIG_STONE) : 0,
  });
}
