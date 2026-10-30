// Types
import type { WeaponStats } from './weapon-stats';

/**
 * How a perk that fits no formula changes a weapon's stats (see
 * `CustomPerk`).
 *
 * @param stats The stats being built (a copy of `base`), changed in place.
 * @param base The weapon's stats before any upgrade.
 * @param level The weapon's upgrade level.
 */
export type PerkRule = (stats: WeaponStats, base: WeaponStats, level: number) => void;
