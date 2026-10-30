// Types
import type { GroundItem } from '../types/items';
import type { GroundItems } from './ground-items';

/**
 * The pile of goods (not a bag item) closest in the drop order to within
 * `radius` of (x, y), for joining new goods onto it.
 * @param items The ground.
 * @param x Where across, in tiles.
 * @param y Where down, in tiles.
 * @param radius How close the pile must be, in tiles.
 * @returns The first such pile, or undefined.
 */
export function pileNear(items: GroundItems, x: number, y: number, radius: number): GroundItem | undefined {
  return [...items.values()].find((item: GroundItem): boolean => !item.held && Math.hypot(item.x - x, item.y - y) < radius);
}

/**
 * The tile index of everything on the ground.
 * @param items The ground.
 * @param width The map's width, in tiles.
 * @returns The tile indexes holding at least one item.
 */
export function tileIndexes(items: GroundItems, width: number): Set<number> {
  return new Set([...items.values()].map((item: GroundItem): number => Math.floor(item.y) * width + Math.floor(item.x)));
}

/**
 * Takes everything off the ground on any of these tiles.
 * @param items The ground.
 * @param tiles The [x, y] tiles to clear.
 */
export function eraseUnder(items: GroundItems, tiles: [number, number][]): void {
  for (const [id, item] of items.entries()) {
    if (tiles.some(([x, y]): boolean => Math.floor(item.x) === x && Math.floor(item.y) === y)) {
      items.delete(id);
    }
  }
}
