// Local Imports
import { MAP_HEIGHT, MAP_WIDTH } from './world';

// Types
import type { Tile, WorldMap } from './world';

/**
 * What the map editor's Mix brush scatters, in the order their shares are
 * laid out along the noise (so each gets its own evenly spread tiles).
 */
export const BLEND_KEYS = ['tree', 'rock', 'tombstone', 'cross', 'pumpkin', 'hedge'] as const;
export type BlendKey = (typeof BLEND_KEYS)[number];

/**
 * A Mix brush setting: the percentage of tiles each kind takes (the rest
 * is bare ground).
 */
export type Blend = Partial<Record<BlendKey, number>>;

export const BLEND_LABELS: Record<BlendKey, string> = {
  tree: 'Trees',
  rock: 'Rocks',
  tombstone: 'Headstones',
  cross: 'Crosses',
  pumpkin: 'Pumpkins',
  hedge: 'Hedges',
};

/**
 * Tiles the Mix brush may repaint: grass and the scenery it scatters (and
 * what those become: stumps and dug-up mounds). Paths, paving, stairs,
 * landmarks, and built things are left alone.
 */
export const BLEND_TILES: ReadonlySet<Tile> = new Set<Tile>(['grass', 'tree', 'stump', 'rock', 'tombstone', 'cross', 'mound', 'pumpkin', 'hedge']);

const GRAVES: ReadonlySet<Tile> = new Set<Tile>(['tombstone', 'cross']);

/**
 * Whole percentages, none negative, adding up to at most 100 (scaled down
 * if over). Anything that isn't a Blend comes back empty.
 */
export function cleanBlend(raw: unknown): Blend {
  const out: Blend = {};
  if (!raw || typeof raw !== 'object') {
    return out;
  }
  for (const key of BLEND_KEYS) {
    const v = (raw as Record<string, unknown>)[key];
    if (typeof v === 'number' && Number.isFinite(v) && v > 0) {
      out[key] = Math.min(100, Math.round(v));
    }
  }
  const total = BLEND_KEYS.reduce((sum: number, k: BlendKey): number => sum + (out[k] ?? 0), 0);
  if (total > 100) {
    for (const key of BLEND_KEYS) {
      if (out[key]) {
        out[key] = Math.floor((out[key]! * 100) / total);
      }
    }
  }
  return out;
}

/**
 * A Blend as a short canonical string ("tree:30,rock:5"), empty for none.
 */
export function blendKey(blend: Blend): string {
  return BLEND_KEYS.filter((k: BlendKey): boolean => (blend[k] ?? 0) > 0).map((k: BlendKey): string => `${k}:${blend[k]}`).join(',');
}

export function parseBlendKey(key: string): Blend {
  return cleanBlend(Object.fromEntries(key.split(',').filter(Boolean).map((part: string): [string, number] => {
    const [k, v] = part.split(':');
    return [k, Number(v)];
  })));
}

let noise: Float32Array | null = null;

/**
 * A fixed blue-noise rank in [0, 1) for every tile: tiles whose rank falls
 * in any one range are spread evenly over the map with no grid to them.
 * Built once by placing tiles one at a time in the biggest gap left
 * (wrapping around the edges).
 */
function blueNoise(): Float32Array {
  if (noise) {
    return noise;
  }
  const n = MAP_WIDTH * MAP_HEIGHT;
  const energy = new Float64Array(n);
  const placed = new Uint8Array(n);
  let h = 0x9e3779b9;
  for (let i = 0; i < n; i++) {
    h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d) ^ i;
    energy[i] = ((h >>> 0) / 2 ** 32) * 1e-6;
  }
  const R = 4;
  const SIGMA2 = 2 * 1.6 * 1.6;
  noise = new Float32Array(n);
  for (let k = 0; k < n; k++) {
    let best = -1;
    for (let i = 0; i < n; i++) {
      if (!placed[i] && (best < 0 || energy[i] < energy[best])) {
        best = i;
      }
    }
    placed[best] = 1;
    noise[best] = k / n;
    const bx = best % MAP_WIDTH;
    const by = Math.floor(best / MAP_WIDTH);
    for (let dy = -R; dy <= R; dy++) {
      for (let dx = -R; dx <= R; dx++) {
        const x = (bx + dx + MAP_WIDTH) % MAP_WIDTH;
        const y = (by + dy + MAP_HEIGHT) % MAP_HEIGHT;
        energy[y * MAP_WIDTH + x] += Math.exp(-(dx * dx + dy * dy) / SIGMA2);
      }
    }
  }
  return noise;
}

/**
 * Whether a gravestone can stand on a tile: not at the top of a drop or
 * the foot of a rise facing the camera (the tile in front must be level
 * ground, not stairs).
 */
export function graveFits(map: WorldMap, tx: number, ty: number): boolean {
  return map.level(tx, ty + 1) === map.level(tx, ty) && map.get(tx, ty + 1) !== 'stairs';
}

/**
 * What a Blend puts on a tile (null for bare ground): always the same for
 * the same tile and setting, so repainting changes nothing, and raising one
 * share only adds tiles of that kind.
 */
export function blendTile(map: WorldMap, blend: Blend, tx: number, ty: number): Tile {
  const u = blueNoise()[ty * MAP_WIDTH + tx] * 100;
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
 */
export function blendMatches(now: Tile, want: Tile): boolean {
  return now === want || (want === 'tree' && now === 'stump') || (GRAVES.has(want) && now === 'mound');
}

/**
 * The Blend a group of tiles looks like now, for the editor's picker on
 * ground that was never mixed.
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

/**
 * Remembered Mix settings as saved and sent: each setting's key and the
 * tile indexes painted with it.
 */
export type BlendAreas = Record<string, number[]>;

export function packBlends(byTile: Map<number, string>): BlendAreas {
  const out: BlendAreas = {};
  for (const [i, key] of byTile) {
    (out[key] ??= []).push(i);
  }
  return out;
}

export function unpackBlends(areas: BlendAreas | undefined): Map<number, string> {
  const out = new Map<number, string>();
  for (const [key, list] of Object.entries(areas ?? {})) {
    if (Array.isArray(list)) {
      for (const i of list) {
        if (Number.isInteger(i) && i >= 0 && i < MAP_WIDTH * MAP_HEIGHT) {
          out.set(i, key);
        }
      }
    }
  }
  return out;
}
