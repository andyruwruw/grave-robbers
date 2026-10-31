// Local Imports
import { RAID_RADIUS } from '../config/ai';
import { RAID_TARGETS } from '../config/raid';

// Types
import type { Step } from '../../pathing/types/path';
import type { World } from '../../world/world';

/**
 * The nearest player-built base structure worth raiding (`RAID_TARGETS`:
 * tables, stations, fires, coffins, turrets, wards; never a storage
 * chest) within RAID_RADIUS of (x, y).
 *
 * @param world The world.
 * @param x Where across, in tiles.
 * @param y Where down, in tiles.
 * @returns Its tile, or null if there's none near.
 */
export function raidTarget(world: World, x: number, y: number): Step | null {
  const width = world.map.width;
  let best: Step | null = null;
  let bestD = RAID_RADIUS;
  for (const i of world.structures.keys()) {
    const tx = i % width;
    const ty = Math.floor(i / width);
    const d = Math.hypot(tx + 0.5 - x, ty + 0.5 - y);
    if (d < bestD && RAID_TARGETS.has(world.map.get(tx, ty))) {
      best = { tx, ty };
      bestD = d;
    }
  }
  return best;
}
