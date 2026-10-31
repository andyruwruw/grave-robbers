// Types
import type { WorldMap } from '@halloween/shared/world/world-map';
import type { Site } from '../types/sites';

/**
 * The site whose pad (grown by a margin) a tile is on, if any.
 * @param sites Every site.
 * @param x The tile's column.
 * @param y The tile's row.
 * @param margin Tiles to grow each pad by.
 * @returns The site, or undefined.
 */
export function siteAt(sites: Site[], x: number, y: number, margin = 0): Site | undefined {
  return sites.find((s: Site): boolean => Math.hypot(x + 0.5 - s.x, y + 0.5 - s.y) < s.radius + margin);
}

/**
 * Which site's pad each tile is on.
 * @param map The map.
 * @param sites Every site.
 * @returns One entry per tile, row-major: the site's index, or -1 off every pad.
 */
export function padOwners(map: WorldMap, sites: Site[]): Int16Array {
  const owner = new Int16Array(map.size).fill(-1);
  sites.forEach((s: Site, k: number): void => {
    for (let y = Math.floor(s.y - s.radius); y <= s.y + s.radius; y++) {
      for (let x = Math.floor(s.x - s.radius); x <= s.x + s.radius; x++) {
        if (map.inBounds(x, y) && Math.hypot(x + 0.5 - s.x, y + 0.5 - s.y) < s.radius) {
          owner[map.index(x, y)] = k;
        }
      }
    }
  });
  return owner;
}
