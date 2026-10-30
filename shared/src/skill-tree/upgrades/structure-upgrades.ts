// Local Imports
import { roundTenth } from '../../helpers/math';
import { DIGGER_SECONDS } from '../../structures/automation';
import { LIT } from '../../structures/lights';
import { ALTAR_BLOOD, BELL_RADIUS } from '../../structures/occult';
import { STATIONS } from '../../structures/stations';
import { STRUCTURES } from '../../structures/structure-catalog';
import { SENTRY_DAMAGE, TURRETS } from '../../structures/turrets';

// Types
import type { Station, StructureKind } from '../../structures/types/structures';

/**
 * A structure's full hit points at its builder's level: each upgrade adds
 * 30%.
 *
 * @param kind The structure.
 * @param level Its builder's level.
 * @returns Its full hit points.
 */
export function structureHp(kind: StructureKind, level: number): number {
  return Math.round(STRUCTURES[kind].hp * (1 + 0.3 * level));
}

/**
 * Fuel a fresh built light starts with: lit for good (`LIT`) for lights,
 * the glow time for stations and altars, 0 without a light.
 *
 * @param kind The structure.
 * @returns The starting fuel.
 */
export function lightBurn(kind: StructureKind): number {
  const light = STRUCTURES[kind].light;
  return !light ? 0 : light.burn === Infinity ? LIT : light.burn;
}

/**
 * How far and how bright a built light (or the hand torch) shines at its
 * builder's level: each upgrade widens it 15% and brightens it 10%.
 *
 * @param radius The light's base radius.
 * @param level Its builder's level.
 * @returns The upgraded radius.
 */
export function lightRadius(radius: number, level: number): number {
  return roundTenth(radius * (1 + 0.15 * level));
}

/**
 * How bright a built light (or the hand torch) shines at its builder's level
 * (see `lightRadius`).
 *
 * @param intensity The light's base intensity (1 when missing).
 * @param level Its builder's level.
 * @returns The upgraded intensity.
 */
export function lightIntensity(intensity: number | undefined, level: number): number {
  return roundTenth((intensity ?? 1) * (1 + 0.1 * level));
}

/**
 * Seconds one batch takes in a station at its builder's level: each
 * upgrade makes it half again as fast.
 *
 * @param kind The station.
 * @param level Its builder's level.
 * @returns Seconds per batch.
 */
export function stationSeconds(kind: StructureKind, level: number): number {
  const station: Station = STATIONS[kind]!;
  return roundTenth(station.seconds / (1 + 0.5 * level));
}

/**
 * Damage spikes do each second at their builder's level: each upgrade
 * adds 30%.
 *
 * @param base The trap's damage a second at level 0.
 * @param level Its builder's level.
 * @returns The upgraded damage a second.
 */
export function spikeDamage(base: number, level: number): number {
  return base * (1 + 0.3 * level);
}

/**
 * Blood one offering at an altar gives at its builder's level.
 *
 * @param level The altar builder's level.
 * @returns Blood per offering.
 */
export function altarBlood(level: number): number {
  return ALTAR_BLOOD + level;
}

/**
 * Damage a blood sentry's shot does at its builder's level: each upgrade
 * adds 20%.
 *
 * @param level The sentry builder's level.
 * @returns Damage per shot.
 */
export function sentryDamage(level: number): number {
  return roundTenth(SENTRY_DAMAGE * (1 + 0.2 * level));
}

/**
 * Damage a turret does each time it acts, at its builder's level: each
 * upgrade adds 20%.
 *
 * @param kind The turret.
 * @param level Its builder's level.
 * @returns Damage each time it acts.
 */
export function turretDamage(kind: StructureKind, level: number): number {
  return roundTenth((TURRETS[kind]?.damage ?? 0) * (1 + 0.2 * level));
}

/**
 * Seconds a bone digger takes to dig its grave again at its builder's
 * level.
 *
 * @param level The digger builder's level.
 * @returns Seconds between digs.
 */
export function diggerSeconds(level: number): number {
  return roundTenth(DIGGER_SECONDS / (1 + 0.5 * level));
}

/**
 * How close ghosts may come to a silver bell at its builder's level.
 *
 * @param level The bell builder's level.
 * @returns The radius ghosts keep out of.
 */
export function bellRadius(level: number): number {
  return BELL_RADIUS + 0.5 * level;
}
