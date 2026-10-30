// Packages
import { GEAR, GEAR_KINDS } from '@halloween/shared/gear/gear-catalog';
import { LOOT_MIN_WEAR } from '@halloween/shared/loot/found-gear';
import { gearWear } from '@halloween/shared/skill-tree/upgrades/gear-upgrades';

// Types
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
