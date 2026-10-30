// Local Imports
import { MAP_HEIGHT, MAP_WIDTH } from '../../world/dimensions';
import { BLEND_KEYS, BLEND_TILES, GRAVES, cleanBlend } from './blend';
import { blueNoise } from './blue-noise';

// Types
import type { Tile } from '../../world/tiles';
import type { WorldMap } from '../../world/world-map';
import type { Blend, BlendKey } from './blend';

/**
 * Whether a gravestone can stand on a tile: not at the top of a drop or
 * the foot of a rise facing the camera (the tile in front must be level
 * ground, not stairs).
 *
 * @param map The map.
 * @param tx Tile column.
 * @param ty Tile row.
 * @returns True when a gravestone can go there.
 */
export function graveFits(map: WorldMap, tx: number, ty: number): boolean {
  return map.level(tx, ty + 1) === map.level(tx, ty) && map.get(tx, ty + 1) !== 'stairs';
}

/**
 * What a Blend puts on a tile (null for bare ground): always the same for
 * the same tile and setting, so repainting changes nothing, and raising one
 * share only adds tiles of that kind.
 *
 * @param map The map.
 * @param blend The Mix setting.
 * @param tx Tile column.
 * @param ty Tile row.
 * @returns The tile it gets.
 */
export function blendTile(map: WorldMap, blend: Blend, tx: number, ty: number): Tile {
  const u = blueNoise()[(ty % MAP_HEIGHT) * MAP_WIDTH + (tx % MAP_WIDTH)] * 100;
  let edge = 0;
  for (const key of BLEND_KEYS) {
    edge += blend[key] ?? 0;
    if (u < edge) {
      return GRAVES.has(key) && !graveFits(map, tx, ty) ? 'grass' : key;
    }
  }
  return 'grass';
}

/**
 * Whether a tile already shows what a Blend wants there (a stump counts as
 * a tree and a dug-up mound as a grave, since they grow back).
 *
 * @param now The tile there now.
 * @param want The tile the Blend wants.
 * @returns True when it counts as already right.
 */
export function blendMatches(now: Tile, want: Tile): boolean {
  return now === want || (want === 'tree' && now === 'stump') || (GRAVES.has(want) && now === 'mound');
}

/**
 * The Blend a group of tiles looks like now, for the editor's picker on
 * ground that was never mixed.
 *
 * @param map The map.
 * @param tiles The tiles to measure.
 * @returns The shares they show now.
 */
export function measureBlend(map: WorldMap, tiles: [number, number][]): Blend {
  const counts: Partial<Record<BlendKey, number>> = {};
  let total = 0;
  for (const [x, y] of tiles) {
    const t = map.get(x, y);
    if (!BLEND_TILES.has(t)) {
      continue;
    }
    total++;
    const key = (t === 'stump' ? 'tree' : t === 'mound' ? 'tombstone' : t) as BlendKey | 'grass';
    if (key !== 'grass') {
      counts[key] = (counts[key] ?? 0) + 1;
    }
  }
  return total === 0 ? {} : cleanBlend(Object.fromEntries(BLEND_KEYS.map((k: BlendKey): [BlendKey, number] => [k, ((counts[k] ?? 0) * 100) / total])));
}
