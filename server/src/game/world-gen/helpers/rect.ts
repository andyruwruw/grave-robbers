// Types
import type { Rect } from '../types/geometry';

/**
 * Whether a tile is inside a rectangle, grown by a margin on every side.
 * @param r The rectangle.
 * @param x The tile's column.
 * @param y The tile's row.
 * @param margin Tiles to grow the rectangle by.
 * @returns Whether it is.
 */
export function inside(r: Rect, x: number, y: number, margin = 0): boolean {
  return x >= r.x - margin && y >= r.y - margin && x < r.x + r.w + margin && y < r.y + r.h + margin;
}
