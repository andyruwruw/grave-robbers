// Local Imports
import { EDIT_SIZE_MAX, EDIT_SIZE_MIN } from './map-edit';

/**
 * The tiles a brush of `size` covers around (tx, ty), inside the fence.
 *
 * @param tx Middle tile's column.
 * @param ty Middle tile's row.
 * @param size Tiles across.
 * @param width The map's width.
 * @param height The map's height.
 * @returns The covered tiles.
 */
export function brushTiles(tx: number, ty: number, size: number, width: number, height: number): [number, number][] {
  const r = brushRadius(size);
  const out: [number, number][] = [];
  for (let y = ty - Math.ceil(r); y <= ty + r; y++) {
    for (let x = tx - Math.ceil(r); x <= tx + r; x++) {
      if (Math.hypot(x - tx, y - ty) <= r && x > 0 && y > 0 && x < width - 1 && y < height - 1) {
        out.push([x, y]);
      }
    }
  }
  return out;
}

/**
 * How far from its middle tile a round brush `size` tiles across reaches,
 * in tiles (a brush of 1 is just the middle tile).
 *
 * @param size Tiles across (clamped to EDIT_SIZE_MIN..EDIT_SIZE_MAX).
 * @returns Its reach in tiles.
 */
export function brushRadius(size: number): number {
  return (Math.max(EDIT_SIZE_MIN, Math.min(EDIT_SIZE_MAX, Math.round(size))) - 1) / 2 + 0.35;
}
