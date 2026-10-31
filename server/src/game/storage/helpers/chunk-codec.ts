// Packages
import { MAX_LEVEL, MIN_LEVEL } from '@halloween/shared/world/dimensions';
import { MAX_TURN_CODE } from '@halloween/shared/world/ramps';
import { CHAR_BY_TILE } from '@halloween/shared/world/tile-codec';
import { WorldMap } from '@halloween/shared/world/world-map';

// Local Imports
import { CHUNK_SIZE } from '../config/save';

// Types
import type { Tile } from '@halloween/shared/world/tiles';

/**
 * Every tile kind, in the order a new save numbers them.
 */
export const TILE_PALETTE = Object.keys(CHAR_BY_TILE) as Tile[];

/**
 * The chunk a tile is in, as its file key ("cx.cy").
 * @param i The tile's index.
 * @param width The map's width.
 * @returns The chunk's key.
 */
export function chunkKeyOf(i: number, width: number): string {
  const tx = i % width;
  return `${Math.floor(tx / CHUNK_SIZE)}.${Math.floor((i - tx) / width / CHUNK_SIZE)}`;
}

/**
 * Every chunk key of a map.
 * @param width The map's width.
 * @param height The map's height.
 * @param size Tiles across a chunk.
 * @returns The keys.
 */
export function chunkKeys(width: number, height: number, size = CHUNK_SIZE): string[] {
  const keys: string[] = [];
  for (let cy = 0; cy * size < height; cy++) {
    for (let cx = 0; cx * size < width; cx++) {
      keys.push(`${cx}.${cy}`);
    }
  }
  return keys;
}

/**
 * The tiles a chunk covers.
 * @param key The chunk's key.
 * @param width The map's width.
 * @param height The map's height.
 * @param size Tiles across a chunk.
 * @returns Its corner and size.
 */
function chunkBox(key: string, width: number, height: number, size = CHUNK_SIZE): { x0: number; y0: number; w: number; h: number } {
  const [cx, cy] = key.split('.').map(Number);
  const x0 = cx * size;
  const y0 = cy * size;
  return { x0, y0, w: Math.min(size, width - x0), h: Math.min(size, height - y0) };
}

/**
 * A chunk as bytes: its tiles (as TILE_PALETTE numbers), then their levels
 * (above MIN_LEVEL), then their turn codes, a byte each, row by row.
 * @param map The map.
 * @param key The chunk's key.
 * @returns The chunk file's bytes.
 */
export function encodeChunk(map: WorldMap, key: string): Uint8Array {
  const { x0, y0, w, h } = chunkBox(key, map.width, map.height);
  const n = w * h;
  const out = new Uint8Array(n * 3);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y0 + y) * map.width + x0 + x;
      const k = y * w + x;
      out[k] = TILE_PALETTE.indexOf(map.tileAt(i));
      out[n + k] = map.levelAt(i) - MIN_LEVEL;
      out[2 * n + k] = map.rampAt(i);
    }
  }
  return out;
}

/**
 * How a save's chunk files were written: the tile each number stands for,
 * tiles across a chunk, and the level a 0 byte stands for. Read with
 * these, not today's, so changing any of them doesn't scramble old saves.
 */
export interface ChunkFormat {
  /**
   * The tile each number stands for.
   */
  palette: string[];

  /**
   * Tiles across a chunk.
   */
  chunkSize: number;

  /**
   * The level a 0 byte stands for.
   */
  minLevel: number;
}

/**
 * Rebuilds a map from its chunk files, read in the format they were
 * written in. A missing or short chunk is left as flat grass, so one bad
 * file costs a patch of map, not the world; a tile that no longer exists
 * becomes grass, and levels and turns are kept in range.
 * @param width The map's width.
 * @param height The map's height.
 * @param format How the files were written.
 * @param read Reads a chunk file by key (null if missing).
 * @param log Notes each fix.
 * @returns The map.
 */
export function decodeChunks(width: number, height: number, format: ChunkFormat, read: (key: string) => Uint8Array | null, log: (what: string) => void): WorldMap {
  const { palette, chunkSize, minLevel } = format;
  const tiles: Tile[] = new Array(width * height).fill('grass');
  const levels = new Int8Array(width * height);
  const ramps = new Int8Array(width * height);
  const known = palette.map((name: string): Tile | null => (name in CHAR_BY_TILE ? name as Tile : null));
  for (const key of chunkKeys(width, height, chunkSize)) {
    const bytes = read(key);
    const { x0, y0, w, h } = chunkBox(key, width, height, chunkSize);
    const n = w * h;
    if (!bytes || bytes.length !== n * 3) {
      log(bytes ? 'left a chunk of the wrong size as grass' : 'left a missing chunk as grass');
      continue;
    }
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y0 + y) * width + x0 + x;
        const k = y * w + x;
        const tile = known[bytes[k]];
        if (!tile) {
          log('turned a tile that no longer exists into grass');
        }
        tiles[i] = tile ?? 'grass';
        levels[i] = Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, bytes[n + k] + minLevel));
        ramps[i] = bytes[2 * n + k] <= MAX_TURN_CODE ? bytes[2 * n + k] : 0;
      }
    }
  }
  return WorldMap.fromCells(width, height, tiles, levels, ramps);
}
