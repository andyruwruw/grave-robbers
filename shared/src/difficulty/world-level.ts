/**
 * The world level leans toward the strongest player online: this share
 * of theirs, the rest the average of everyone else's.
 */
const STRONGEST_SHARE = 0.7;

/**
 * Levels per second the world level climbs toward its target, and falls
 * when the target drops (a strong player leaves, say).
 */
export const WORLD_LEVEL_RISE = 1 / 15;

/**
 * Levels per second the world level falls toward a lower target.
 */
export const WORLD_LEVEL_FALL = 1 / 60;

/**
 * Most levels the TV's Game tab can add to the world level, and how many
 * each press adds or takes away.
 */
export const WORLD_LEVEL_BOOST_MAX = 60;

/**
 * Levels each press of the Game tab's boost adds or takes away.
 */
export const WORLD_LEVEL_BOOST_STEP = 5;

/**
 * The level the world heads for, given the levels of everyone online:
 * mostly the strongest, partly the average of the rest. Null with nobody
 * online, so an idle server stays where it was.
 *
 * @param levels The level of everyone online.
 * @returns The target, or null with nobody online.
 */
export function worldLevelTarget(levels: number[]): number | null {
  if (levels.length === 0) {
    return null;
  }
  const sorted = [...levels].sort((a: number, b: number): number => b - a);
  if (sorted.length === 1) {
    return sorted[0];
  }
  const rest = sorted.slice(1);
  return STRONGEST_SHARE * sorted[0] + (1 - STRONGEST_SHARE) * (rest.reduce((a: number, b: number): number => a + b, 0) / rest.length);
}
