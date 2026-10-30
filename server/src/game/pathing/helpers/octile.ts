/**
 * Octile distance, the exact cost of an open 8-way walk.
 * @param ax The first tile's column.
 * @param ay The first tile's row.
 * @param bx The second tile's column.
 * @param by The second tile's row.
 * @returns The distance in tiles.
 */
export function octile(ax: number, ay: number, bx: number, by: number): number {
  const dx = Math.abs(ax - bx);
  const dy = Math.abs(ay - by);
  return Math.max(dx, dy) + (Math.SQRT2 - 1) * Math.min(dx, dy);
}
