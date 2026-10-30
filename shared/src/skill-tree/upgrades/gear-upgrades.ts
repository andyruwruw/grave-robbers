// Local Imports
import { GEAR } from '../../gear/gear-catalog';
import { WEAPON_PERKS } from '../../gear/perks/weapon-perks';
import { STEADY_SUPPLY } from '../../gear/ranged-rules';
import { levelOf } from '../progress';

// Types
import type { GearKind } from '../../gear/types/gear-def';
import type { WeaponStats } from '../../gear/types/weapon-stats';
import type { TreeState } from '../types/skill-tree';

/**
 * A weapon's stats at a level, each upgrade adding its perk (see
 * `WEAPON_PERKS`). A bow or crossbow also spares its ammo now and then, by
 * the arrows' level (Steady supply). No weapon at all is the hammer.
 *
 * @param kind The weapon, or null for none.
 * @param tree The player's progress.
 * @returns The upgraded stats (a new object).
 */
export function weaponStats(kind: GearKind | null, tree: TreeState): WeaponStats {
  kind ??= 'hammer';
  const base = GEAR[kind].weapon!;
  const level = levelOf(`gear:${kind}`, tree);
  const stats = { ...base };
  WEAPON_PERKS[kind]?.apply(stats, base, level);
  if (base.ammo === 'arrows' || base.ammo === 'bolts') {
    stats.thrift = STEADY_SUPPLY * levelOf('mat:arrows', tree);
  }
  return stats;
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
