// Packages
import { LEVEL_HEIGHT } from '@halloween/shared/world/dimensions';

// Local Imports
import { CHASM_DEPTH, FLOORS, GROUND } from '../config/terrain-shape';

// Types
import type { Tile } from '@halloween/shared/world/tiles';
import type { WorldMap } from '@halloween/shared/world/world-map';

/**
 * Whether a tile is bare ground (nothing standing on it).
 * @param tile The tile.
 * @returns True when it's in GROUND.
 */
export function isGround(tile: Tile): boolean {
  return GROUND.has(tile);
}

/**
 * The middle front tile of a mausoleum, which gets the door and lantern.
 * @param map The map.
 * @param tx Tile column.
 * @param ty Tile row.
 * @returns True for the door tile.
 */
export function isMausoleumDoor(map: WorldMap, tx: number, ty: number): boolean {
  return map.get(tx, ty) === 'mausoleum' && map.get(tx, ty + 1) !== 'mausoleum' && map.get(tx - 1, ty) === 'mausoleum' && map.get(tx + 1, ty) === 'mausoleum';
}

/**
 * The most common floor among a tile's neighbors, so a statue on a hill
 * stands on the hill and a wall built on a path has dirt under it.
 * @param map The map.
 * @param tx Tile column.
 * @param ty Tile row.
 * @returns The floor to paint under the tile (grass when none is beside it).
 */
export function floorUnder(map: WorldMap, tx: number, ty: number): Tile {
  const counts = new Map<Tile, number>();
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const n = map.get(tx + dx, ty + dy);
    const floor = n === 'spawn' ? 'path' : n;
    if (FLOORS.includes(floor)) {
      counts.set(floor, (counts.get(floor) ?? 0) + 1);
    }
  }
  let best: Tile = 'grass';
  let bestCount = 0;
  for (const [floor, count] of counts) {
    if (count > bestCount) {
      best = floor;
      bestCount = count;
    }
  }
  return best;
}

/**
 * The height of a tile's ground for the walls beside it: a chasm's is its
 * far-off floor.
 * @param map The map.
 * @param tx Tile column.
 * @param ty Tile row.
 * @returns The ground height in world units.
 */
export function groundHeight(map: WorldMap, tx: number, ty: number): number {
  return map.get(tx, ty) === 'chasm' ? CHASM_DEPTH : map.level(tx, ty) * LEVEL_HEIGHT;
}

/**
 * Whether the tile at (tx, ty) is a ramp rising in direction (dx, dy).
 * @param map The map.
 * @param tx Tile column.
 * @param ty Tile row.
 * @param dx Step east.
 * @param dy Step south.
 * @returns True when the ramp climbs that way.
 */
export function ledTo(map: WorldMap, tx: number, ty: number, dx: number, dy: number): boolean {
  const up = map.rampUp(tx, ty);
  return !!up && up[0] === dx && up[1] === dy;
}

/**
 * A flagstone gap in the crypt wall: crypt on one side along the wall line,
 * and open ground (not the crypt floor) straight out the other way.
 * @param map The map.
 * @param tx Tile column.
 * @param ty Tile row.
 * @returns True for a doorway.
 */
export function isDoorway(map: WorldMap, tx: number, ty: number): boolean {
  if (map.get(tx, ty) !== 'flagstone') {
    return false;
  }
  /**
   * Whether a tile is outside the crypt (not its floor or wall).
   * @param t The tile.
   * @returns True when outside.
   */
  const outside = (t: Tile): boolean => t !== 'flagstone' && t !== 'crypt';
  const inHorizontalWall = (map.get(tx - 1, ty) === 'crypt' || map.get(tx + 1, ty) === 'crypt')
    && (outside(map.get(tx, ty - 1)) || outside(map.get(tx, ty + 1)));
  const inVerticalWall = (map.get(tx, ty - 1) === 'crypt' || map.get(tx, ty + 1) === 'crypt')
    && (outside(map.get(tx - 1, ty)) || outside(map.get(tx + 1, ty)));
  return inHorizontalWall || inVerticalWall;
}

/**
 * Whether a doorway is right beside the tile.
 * @param map The map.
 * @param tx Tile column.
 * @param ty Tile row.
 * @returns True when a side neighbor is a doorway.
 */
export function besideDoorway(map: WorldMap, tx: number, ty: number): boolean {
  return [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]): boolean => isDoorway(map, tx + dx, ty + dy));
}
