// Types
import type { StructureKind, TurretDef } from './types/structures';

/**
 * A blood sentry: shots one blood buys, most shots it holds, range
 * (tiles), seconds between shots, and damage per shot at level 0.
 */
export const SENTRY_SHOTS_PER_BLOOD = 3;

/**
 * Most shots a blood sentry holds.
 */
export const SENTRY_MAX_SHOTS = 30;

/**
 * A blood sentry's range (tiles).
 */
export const SENTRY_RANGE = 6;

/**
 * Seconds between a blood sentry's shots.
 */
export const SENTRY_COOLDOWN = 1.2;

/**
 * A blood sentry's damage per shot at level 0.
 */
export const SENTRY_DAMAGE = 3;

/**
 * Every turret's stats, weakest to strongest (the phone lists them in this
 * order).
 */
export const TURRETS: Partial<Record<StructureKind, TurretDef>> = {
  'bolt-turret': { fires: 'shot', ammo: 'bolts', shots: 1, most: 30, range: 6, cooldown: 1.5, damage: 2, knockback: 0.6 },
  'swiper': { fires: 'sweep', ammo: null, shots: 0, most: 0, range: 1.5, cooldown: 1, damage: 3, knockback: 0.9 },
  'sentry': { fires: 'shot', ammo: 'blood', shots: SENTRY_SHOTS_PER_BLOOD, most: SENTRY_MAX_SHOTS, range: SENTRY_RANGE, cooldown: SENTRY_COOLDOWN, damage: SENTRY_DAMAGE, knockback: 0.8 },
  'flamethrower': { fires: 'flame', ammo: 'wood', shots: 6, most: 48, range: 3.5, cooldown: 0.35, damage: 0.7, knockback: 0.1, cone: 0.45, burn: 1.5 },
  'ballista': { fires: 'shot', ammo: 'bolts', shots: 1, most: 20, range: 9, cooldown: 2.5, damage: 12, knockback: 2, pierce: 3 },
};
