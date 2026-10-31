// Types
import type { MonsterSpot } from '../types/monster-spot';

/**
 * The monsters within `radius` of (x, y).
 * @param monsters Every monster to consider.
 * @param x The center (tiles).
 * @param y The center (tiles).
 * @param radius How far (tiles).
 * @returns Those in reach.
 */
export const within = (monsters: MonsterSpot[], x: number, y: number, radius: number): MonsterSpot[] =>
  monsters.filter((m: MonsterSpot): boolean => Math.hypot(m.x - x, m.y - y) <= radius);

/**
 * The monster nearest (x, y) within `radius`, skipping some.
 * @param monsters Every monster to consider.
 * @param x Where from (tiles).
 * @param y Where from (tiles).
 * @param radius How far it may be (tiles).
 * @param skip Ids to pass over.
 * @returns The nearest one, or null.
 */
export const nearest = (monsters: MonsterSpot[], x: number, y: number, radius: number, skip: Set<number>): MonsterSpot | null => {
  let best: MonsterSpot | null = null;
  let bestDist = radius;
  for (const m of monsters) {
    const d = Math.hypot(m.x - x, m.y - y);
    if (!skip.has(m.id) && d <= bestDist) {
      best = m;
      bestDist = d;
    }
  }
  return best;
};

/**
 * The monsters along a line running `length` tiles from (x, y) along
 * `angle`, at most `width` tiles to either side of it.
 * @param monsters Every monster to consider.
 * @param x Where it starts (tiles).
 * @param y Where it starts (tiles).
 * @param angle Which way it runs (radians).
 * @param length How far it runs (tiles).
 * @param width How far either side it reaches (tiles).
 * @returns Those on it.
 */
export const alongLine = (monsters: MonsterSpot[], x: number, y: number, angle: number, length: number, width: number): MonsterSpot[] => {
  const fx = Math.cos(angle);
  const fy = Math.sin(angle);
  return monsters.filter((m: MonsterSpot): boolean => {
    const dx = m.x - x;
    const dy = m.y - y;
    const ahead = dx * fx + dy * fy;
    return ahead > 0 && ahead <= length && Math.abs(dx * fy - dy * fx) <= width;
  });
};
