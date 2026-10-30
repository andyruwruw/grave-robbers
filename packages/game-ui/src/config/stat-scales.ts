// Packages
import { HAMMER } from '@halloween/shared/gear/defs/melee-weapons';
import { GEAR, GEAR_KINDS } from '@halloween/shared/gear/gear-catalog';
import { STRUCTURES, STRUCTURE_KINDS } from '@halloween/shared/structures/structure-catalog';
import { TURRETS } from '@halloween/shared/structures/turrets';
import { MAX_UPGRADE_LEVEL } from '@halloween/shared/skill-tree/upgrade-cost';
import { lightIntensity, lightRadius } from '@halloween/shared/skill-tree/upgrades/structure-upgrades';

// Local Imports
import { TOP } from './item-details';

// Types
import type { GearKind } from '@halloween/shared/gear/types/gear-def';
import type { StructureKind, TurretDef } from '@halloween/shared/structures/types/structures';

/**
 * Every gear kind that is a weapon.
 */
const WEAPONS = GEAR_KINDS.filter((k: GearKind): boolean => !!GEAR[k].weapon);

/**
 * The largest of some numbers.
 *
 * @param values - The numbers.
 * @returns The largest.
 */
const max = (values: number[]): number => Math.max(...values);

/**
 * Every turret's stats.
 */
const TURRET_DEFS = Object.values(TURRETS) as TurretDef[];

/**
 * A full Damage bar: the hardest-hitting weapon at its best upgrade.
 */
export const STAT_MAX_DAMAGE = max(WEAPONS.map((k: GearKind): number => GEAR[k].weapon!.damage)) * TOP;

/**
 * A full Swing speed bar: swings a second of the quickest weapon.
 */
export const STAT_MAX_SPEED = max(WEAPONS.map((k: GearKind): number => 1 / GEAR[k].weapon!.cooldown));

/**
 * A full Reach bar: the longest weapon.
 */
export const STAT_MAX_REACH = max(WEAPONS.map((k: GearKind): number => GEAR[k].weapon!.reach));

/**
 * A full Knockback bar: the weapon that knocks back furthest.
 */
export const STAT_MAX_KNOCKBACK = max(WEAPONS.map((k: GearKind): number => GEAR[k].weapon!.knockback));

/**
 * A full Gathering bar: the hammer's chop at its best upgrade.
 */
export const STAT_MAX_CHOP = HAMMER.chop! + MAX_UPGRADE_LEVEL;

/**
 * A full Damage a second bar for turrets.
 */
export const STAT_MAX_TURRET_DPS = max(TURRET_DEFS.map((t: TurretDef): number => t.damage / t.cooldown)) * TOP;

/**
 * A full Fire rate bar for turrets.
 */
export const STAT_MAX_TURRET_RATE = max(TURRET_DEFS.map((t: TurretDef): number => 1 / t.cooldown));

/**
 * A full Range bar for turrets.
 */
export const STAT_MAX_TURRET_RANGE = max(TURRET_DEFS.map((t: TurretDef): number => t.range));

/**
 * A full Lasts (hits) bar: the stake's wear at its best upgrade.
 */
export const STAT_MAX_HITS = GEAR.stake.wear + MAX_UPGRADE_LEVEL;

/**
 * A full Toughness bar for structures.
 */
export const STAT_MAX_HP = max(STRUCTURE_KINDS.map((k: StructureKind): number => STRUCTURES[k].hp)) * 1.9;

/**
 * A full Light bar: the widest light at its best upgrade.
 */
export const STAT_MAX_RADIUS = lightRadius(max(STRUCTURE_KINDS.map((k: StructureKind): number => STRUCTURES[k].light?.radius ?? 0)), MAX_UPGRADE_LEVEL);

/**
 * A full Brightness bar: the brightest light at its best upgrade.
 */
export const STAT_MAX_BRIGHTNESS = lightIntensity(max(STRUCTURE_KINDS.map((k: StructureKind): number => STRUCTURES[k].light?.intensity ?? 1)), MAX_UPGRADE_LEVEL);
