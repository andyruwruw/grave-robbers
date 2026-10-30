// Types
import type { WorldMap } from './world-map';

/**
 * How far from a tree's center its branches slow walkers down: past half a
 * tile, so the gap between two trees side by side slows too, but brushing
 * along the outside of a tree doesn't.
 */
export const TRUNK_RADIUS = 0.58;

/**
 * Whether (x, y) is among a tree's branches.
 *
 * @param map The map.
 * @param x Tile-space x.
 * @param y Tile-space y.
 * @returns True when within TRUNK_RADIUS of a tree's middle.
 */
export function inTrunk(map: WorldMap, x: number, y: number): boolean {
  const tx = Math.floor(x);
  const ty = Math.floor(y);
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (map.get(tx + dx, ty + dy) === 'tree' && Math.hypot(x - (tx + dx + 0.5), y - (ty + dy + 0.5)) < TRUNK_RADIUS) {
        return true;
      }
    }
  }
  return false;
}
