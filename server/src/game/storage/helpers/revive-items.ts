// Packages
import { GEAR } from '@halloween/shared/gear/gear-catalog';
import { ESSENCES } from '@halloween/shared/gear/infusions/config/essences';
import { pathOf } from '@halloween/shared/gear/infusions/helpers/infusion-paths';
import { GOODS, MATERIAL_STACK, MATERIALS, RESOURCES } from '@halloween/shared/goods/goods';
import { BAG_SLOTS, BUILD_STACK, emptyGear } from '@halloween/shared/inventory/bag-items';
import { TREE } from '@halloween/shared/skill-tree/nodes';
import { MAX_UPGRADE_LEVEL } from '@halloween/shared/skill-tree/upgrade-cost';
import { STRUCTURES } from '@halloween/shared/structures/structure-catalog';

// Local Imports
import { bool, int, isRaw, num } from './revive-values';

// Types
import type { GearKind, GearSlot } from '@halloween/shared/gear/types/gear-def';
import type { Essence, Infusion, InfusionLevel } from '@halloween/shared/gear/types/infusion';
import type { Bundle, Goods, Inventory, Material } from '@halloween/shared/goods/goods';
import type { BagItem, Gear, GearItem } from '@halloween/shared/inventory/bag-items';
import type { NodeId, TreeState } from '@halloween/shared/skill-tree/types/skill-tree';
import type { StructureKind } from '@halloween/shared/structures/types/structures';
import type { RepairLog } from '../repair-log';

/**
 * Every skill tree node id there is now.
 */
const NODE_IDS = new Set<string>(TREE.map((n): string => n.id));

/**
 * The goods in a saved bundle that still exist, as whole amounts of at
 * least 0 (anything else dropped).
 * @param v The saved bundle.
 * @param log Where fixes are noted.
 * @param what The field.
 * @returns The goods kept.
 */
export function reviveBundle(v: unknown, log: RepairLog, what: string): Partial<Bundle> {
  if (!isRaw(v)) {
    if (v !== undefined) {
      log.note(`replaced bad ${what}`);
    }
    return {};
  }
  const out: Partial<Bundle> = {};
  for (const [key, amount] of Object.entries(v)) {
    if ((GOODS as string[]).includes(key)) {
      out[key as Goods] = int(amount, 0, log, `${what} ${key}`, 0);
    } else {
      log.note(`dropped unknown good ${key}`);
    }
  }
  return out;
}

/**
 * A player's candy and blood (any missing as 0).
 * @param v The saved inventory.
 * @param log Where fixes are noted.
 * @returns The inventory.
 */
export function reviveInventory(v: unknown, log: RepairLog): Inventory {
  const raw = isRaw(v) ? v : {};
  return Object.fromEntries(RESOURCES.map((r): [string, number] => [r, int(raw[r], 0, log, r, 0)])) as Inventory;
}

/**
 * A saved item's infusion, if its kind still has that path and level (an
 * infusion that no longer exists is dropped; a level past the path's end
 * comes down to it).
 * @param v The saved infusion.
 * @param kind The item's kind.
 * @param log Where fixes are noted.
 * @returns The infusion, or undefined for none.
 */
function reviveInfusion(v: unknown, kind: GearKind, log: RepairLog): Infusion | undefined {
  if (!isRaw(v) || typeof v.essence !== 'string' || !(ESSENCES as string[]).includes(v.essence)) {
    log.note('dropped a bad infusion');
    return undefined;
  }
  const essence = v.essence as Essence;
  const most = pathOf(kind, essence)?.length ?? 0;
  if (most === 0) {
    log.note('dropped an infusion that no longer exists');
    return undefined;
  }
  return { essence, level: int(v.level, 1, log, 'infusion level', 1, most) as InfusionLevel };
}

/**
 * One bag item, if what it is still exists: gear, a stack of a structure,
 * or a stack of a material (stacks kept to their limits).
 * @param v The saved item.
 * @param log Where fixes are noted.
 * @returns The item, or null to drop it.
 */
export function reviveBagItem(v: unknown, log: RepairLog): BagItem | null {
  if (!isRaw(v)) {
    return null;
  }
  if (typeof v.kind === 'string' && v.kind in GEAR) {
    const item: GearItem = { kind: v.kind as GearItem['kind'], wear: num(v.wear, 0, log, 'gear wear', 0) };
    if (v.fired !== undefined) {
      item.fired = int(v.fired, 0, log, 'gear fired', 0);
    }
    if (v.empty !== undefined) {
      item.empty = bool(v.empty, false, log, 'gear empty');
    }
    if (v.infusion !== undefined) {
      const infusion = reviveInfusion(v.infusion, item.kind, log);
      if (infusion) {
        item.infusion = infusion;
      }
    }
    return item;
  }
  if (typeof v.build === 'string' && v.build in STRUCTURES) {
    return { build: v.build as StructureKind, count: int(v.count, 1, log, 'stack count', 1, BUILD_STACK) };
  }
  if (typeof v.material === 'string' && (MATERIALS as string[]).includes(v.material)) {
    return { material: v.material as Material, count: int(v.count, 1, log, 'stack count', 1, MATERIAL_STACK) };
  }
  log.note('dropped an item that no longer exists');
  return null;
}

/**
 * A list of slots kept to a length: items revived in place, any past the
 * end moved into empty slots, and any that still don't fit dropped.
 * @param v The saved slots.
 * @param length How many slots there are now.
 * @param log Where fixes are noted.
 * @param extra Items that need a slot too (gear that can't stay equipped).
 * @returns The slots.
 */
export function reviveSlots(v: unknown, length: number, log: RepairLog, extra: BagItem[] = []): (BagItem | null)[] {
  const saved = Array.isArray(v) ? v : [];
  const slots: (BagItem | null)[] = Array.from({ length }, (_, i: number): BagItem | null => (saved[i] == null ? null : reviveBagItem(saved[i], log)));
  for (const item of [...saved.slice(length).map((s: unknown): BagItem | null => (s == null ? null : reviveBagItem(s, log))), ...extra]) {
    if (item) {
      const free = slots.indexOf(null);
      if (free === -1) {
        log.note('dropped an item with no room left');
      } else {
        slots[free] = item;
        log.note('moved an item to another slot');
      }
    }
  }
  return slots;
}

/**
 * A player's bag and what they have equipped. Gear equipped in a slot it
 * no longer goes in is moved into the bag.
 * @param v The saved gear.
 * @param log Where fixes are noted.
 * @returns The gear.
 */
export function reviveGear(v: unknown, log: RepairLog): Gear {
  if (!isRaw(v)) {
    log.note('replaced a bad bag');
    return emptyGear();
  }
  const equipped = emptyGear().equipped;
  const unequipped: BagItem[] = [];
  const saved = isRaw(v.equipped) ? v.equipped : {};
  for (const [slot, raw] of Object.entries(saved)) {
    const item = raw == null ? null : reviveBagItem(raw, log);
    if (item && 'kind' in item && slot in equipped && GEAR[item.kind].slot === slot) {
      equipped[slot as GearSlot] = item;
    } else if (item) {
      unequipped.push(item);
    }
  }
  return { equipped, bag: reviveSlots(v.bag, BAG_SLOTS, log, unequipped) };
}

/**
 * A player's skill tree: only nodes that still exist, levels kept to
 * 0..MAX_UPGRADE_LEVEL.
 * @param v The saved tree.
 * @param log Where fixes are noted.
 * @returns The tree.
 */
export function reviveTree(v: unknown, log: RepairLog): TreeState {
  const raw = isRaw(v) ? v : {};
  const found = (Array.isArray(raw.found) ? raw.found : []).filter((id: unknown): id is NodeId => {
    const known = typeof id === 'string' && NODE_IDS.has(id);
    if (!known) {
      log.note('dropped an unknown tree node');
    }
    return known;
  });
  const levels: TreeState['levels'] = {};
  for (const [id, level] of Object.entries(isRaw(raw.levels) ? raw.levels : {})) {
    if (NODE_IDS.has(id)) {
      levels[id as NodeId] = int(level, 0, log, 'tree level', 0, MAX_UPGRADE_LEVEL);
    } else {
      log.note('dropped an unknown tree node');
    }
  }
  return { found: [...new Set(found)], levels };
}
