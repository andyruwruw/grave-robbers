// Local Imports
import { GEAR } from '../../gear/gear-catalog';
import { applyInfusion } from '../../gear/infusions/helpers/apply-infusion';
import { WEAPON_PERKS } from '../../gear/perks/weapon-perks';
import { STEADY_SUPPLY } from '../../gear/ranged-rules';
import { levelOf } from '../progress';

// Types
import type { GearKind } from '../../gear/types/gear-def';
import type { Infusion } from '../../gear/types/infusion';
import type { WeaponStats } from '../../gear/types/weapon-stats';
import type { GearItem } from '../../inventory/bag-items';
import type { TreeState } from '../types/skill-tree';

/**
 * A weapon's stats at a level, each upgrade adding its perk (see
 * `WEAPON_PERKS`), then its infusion: the essence's package and the
 * variant's twist (see `applyInfusion`). A flamethrower made from a
 * pellet gun (Hellmouth) sprays harder in step with the pellets its perk
 * added (each one on top of the blunderbuss's 5 adds a fifth). A bow or crossbow
 * also spares its ammo now and then, by the arrows' level (Steady
 * supply). No weapon at
 * all is the hammer; the infused hammer levels and perks with the hammer.
 *
 * @param kind The weapon, or null for none.
 * @param tree The player's progress.
 * @param infusion The item's infusion, if any.
 * @returns The upgraded stats (a new object).
 */
export function weaponStats(kind: GearKind | null, tree: TreeState, infusion?: Infusion | null): WeaponStats {
  kind ??= 'hammer';
  const base = GEAR[kind].weapon!;
  const node = kind === 'infused-hammer' ? 'hammer' : kind;
  const level = levelOf(`gear:${node}`, tree);
  const stats = { ...base };
  WEAPON_PERKS[node]?.apply(stats, base, level);
  if (base.ammo === 'arrows' || base.ammo === 'bolts') {
    stats.thrift = STEADY_SUPPLY * levelOf('mat:arrows', tree);
  }
  applyInfusion(stats, kind, infusion);
  if (stats.spray && base.pellets && stats.pellets) {
    stats.spray = { ...stats.spray, rate: Math.round(((stats.spray.rate * stats.pellets) / base.pellets) * 100) / 100 };
  }
  return stats;
}

/**
 * The stats of a piece of gear in hand, with its kind's upgrades and its
 * own infusion (the hammer's with none).
 *
 * @param item The weapon, or null for none.
 * @param tree The player's progress.
 * @returns Its stats (a new object).
 */
export function itemStats(item: Pick<GearItem, 'kind' | 'infusion'> | null | undefined, tree: TreeState): WeaponStats {
  return weaponStats(item?.kind ?? null, tree, item?.infusion);
}

/**
 * How long a fresh piece of gear lasts: each upgrade adds a quarter, or
 * one more use for the stake (single-use to start).
 *
 * @param kind The gear kind.
 * @param tree The player's progress.
 * @returns Its uses when fresh.
 */
export function gearWear(kind: GearKind, tree: TreeState): number {
  const level = levelOf(`gear:${kind}`, tree);
  return kind === 'stake' ? GEAR.stake.wear + level : Math.round(GEAR[kind].wear * (1 + 0.25 * level));
}

/**
 * What a raised shield or armor multiplies damage by: each upgrade takes
 * off 0.05 more for armor, 0.03 for a shield.
 *
 * @param kind The armor or shield.
 * @param tree The player's progress.
 * @returns The damage multiplier.
 */
export function gearGuard(kind: GearKind, tree: TreeState): number {
  return Math.round(((GEAR[kind].guard ?? 1) - (kind === 'shield' ? 0.03 : 0.05) * levelOf(`gear:${kind}`, tree)) * 100) / 100;
}
