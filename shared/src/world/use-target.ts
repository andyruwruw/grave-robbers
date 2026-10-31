// Local Imports
import { STATIONS } from '../structures/stations';
import { STRUCTURES, isStructure } from '../structures/structure-catalog';
import { TURRETS } from '../structures/turrets';
import { facingTile } from './targeting';

// Types
import type { Tile } from './tiles';

/**
 * How far (tiles, from a player's middle) USE reaches along the way it's
 * pointed.
 */
export const USE_REACH = 2.2;

/**
 * The map as USE's search reads it.
 */
interface UseMap {
  /**
   * What a tile is.
   */
  get(tx: number, ty: number): Tile;

  /**
   * Whether a tile blocks the way.
   */
  isSolid(tx: number, ty: number): boolean;
}

/**
 * What USE does to a tile it can find from afar, or null if it only acts
 * on the facing tile there (lights, sprouts) or does nothing.
 *
 * @param tile The tile.
 * @returns The verb, such as 'Open'.
 */
export function useVerb(tile: Tile): string | null {
  if (tile === 'chest' || tile === 'stash' || tile === 'digger' || tile === 'sorter' || tile === 'research-table' || tile === 'anvil') {
    return 'Open';
  }
  if (!isStructure(tile)) {
    return null;
  }
  if (STATIONS[tile]) {
    return 'Open';
  }
  if (tile === 'altar') {
    return 'Offer at';
  }
  return TURRETS[tile] ? 'Load' : null;
}

/**
 * The prompt for USE on a tile, such as 'Open Sawmill'.
 *
 * @param tile The tile.
 * @returns The prompt, or null if USE doesn't find it from afar.
 */
export function useLabel(tile: Tile): string | null {
  const verb = useVerb(tile);
  if (!verb) {
    return null;
  }
  return `${verb} ${isStructure(tile) ? STRUCTURES[tile].label : 'Chest'}`;
}

/**
 * The tile USE acts on for a player at (x, y): the first tile USE finds
 * from afar (`useVerb`) within USE_REACH the way they point, toward
 * tile-space point `toward` (the mouse on /play) or else along `facing`,
 * stopping at anything solid in the way. With nothing found, the facing
 * tile.
 *
 * @param map The map.
 * @param x Tile-space x.
 * @param y Tile-space y.
 * @param facing Radians.
 * @param toward The tile-space point pointed at, or null.
 * @returns The tile, and whether the search found it.
 */
export function useTarget(map: UseMap, x: number, y: number, facing: number, toward: { x: number; y: number } | null): { tx: number; ty: number; found: boolean } {
  const angle = toward && Math.hypot(toward.x - x, toward.y - y) > 0.3 ? Math.atan2(toward.y - y, toward.x - x) : facing;
  const ox = Math.floor(x);
  const oy = Math.floor(y);
  for (let reach = 0.4; reach <= USE_REACH; reach += 0.2) {
    const tx = Math.floor(x + Math.cos(angle) * reach);
    const ty = Math.floor(y + Math.sin(angle) * reach);
    if (tx === ox && ty === oy) {
      continue;
    }
    if (useVerb(map.get(tx, ty))) {
      return { tx, ty, found: true };
    }
    if (map.isSolid(tx, ty)) {
      break;
    }
  }
  return { ...facingTile(x, y, facing), found: false };
}
