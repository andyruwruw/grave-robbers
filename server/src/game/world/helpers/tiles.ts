// Packages
import { MAP_HEIGHT, MAP_WIDTH } from '@halloween/shared/world/dimensions';

// Types
import type { MapView } from '@halloween/shared/protocol/tv-tools';
import type { Tile } from '@halloween/shared/world/tiles';
import type { WorldMap } from '@halloween/shared/world/world-map';

/**
 * A classic map's count scaled to this map's area.
 * @param map The map.
 * @param count The count on a classic-sized map.
 * @returns The count for this map's area.
 */
export function perArea(map: WorldMap, count: number): number {
  return Math.round((count * map.size) / (MAP_WIDTH * MAP_HEIGHT));
}

/**
 * Tiles of these kinds on the map.
 * @param map The map.
 * @param tiles The kinds to count.
 * @returns How many tiles are one of them.
 */
export function countTiles(map: WorldMap, ...tiles: Tile[]): number {
  let n = 0;
  for (let ty = 0; ty < map.height; ty++) {
    for (let tx = 0; tx < map.width; tx++) {
      n += tiles.includes(map.get(tx, ty)) ? 1 : 0;
    }
  }
  return n;
}

/**
 * Whether a tile is inside the map's view (always, unless the map only
 * uses part of the grid, like the sandbox).
 * @param view The part of the map the TV frames, or null for all of it.
 * @param tx The tile's column.
 * @param ty The tile's row.
 * @returns Whether the tile is in view.
 */
export function inView(view: MapView | null, tx: number, ty: number): boolean {
  const v = view;
  return !v || (tx >= v.x && ty >= v.y && tx < v.x + v.w && ty < v.y + v.h);
}
