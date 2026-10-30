// Packages
import { RAMP_DIRS } from '@halloween/shared/world/ramps';

// Types
import type { WorldMap } from '@halloween/shared/world/world-map';

/**
 * Where the map editor's stairs could go for a pointed-at tile, each with
 * the way (an index into RAMP_DIRS) they'd climb: on the tile itself, up
 * to any open neighbor standing higher, or, when nothing around it is
 * higher (the top of a wall), at the foot of each wall it stands over,
 * climbing up into it (the one facing the camera first).
 * @param map The map, or null before a world arrives.
 * @param mapWidth The map's width in tiles.
 * @param mapHeight The map's height in tiles.
 * @param tx Tile x pointed at.
 * @param ty Tile y pointed at.
 * @returns The places stairs could go.
 */
export function stairsOptions(map: WorldMap | null, mapWidth: number, mapHeight: number, tx: number, ty: number): { tx: number; ty: number; dir: number }[] {
  if (!map || map.isSolid(tx, ty) || tx <= 0 || ty <= 0 || tx >= mapWidth - 1 || ty >= mapHeight - 1) {
    return [];
  }
  const own = map.base(tx, ty);
  const up = RAMP_DIRS.flatMap(([dx, dy], i: number) => (!map.isSolid(tx + dx, ty + dy) && map.base(tx + dx, ty + dy) > own ? [{ tx, ty, dir: i }] : []));
  if (up.length > 0) {
    return up;
  }
  return RAMP_DIRS.flatMap(([dx, dy], i: number) => {
    const fx = tx - dx;
    const fy = ty - dy;
    const ok = fx > 0 && fy > 0 && fx < mapWidth - 1 && fy < mapHeight - 1 && !map.isSolid(fx, fy) && map.get(fx, fy) !== 'stairs' && map.base(fx, fy) < own;
    return ok ? [{ tx: fx, ty: fy, dir: i }] : [];
  }).sort((a, b): number => b.ty - a.ty);
}

/**
 * The way (an index into RAMP_DIRS) the stairs on a tile climb, or null.
 * @param map The map, or null before a world arrives.
 * @param tx Tile x.
 * @param ty Tile y.
 * @returns The way, or null.
 */
export function rampDir(map: WorldMap | null, tx: number, ty: number): number | null {
  const up = map?.rampUp(tx, ty);
  return up ? RAMP_DIRS.findIndex(([dx, dy]): boolean => dx === up[0] && dy === up[1]) : null;
}
