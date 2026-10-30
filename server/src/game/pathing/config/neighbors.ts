/**
 * The eight steps a search takes from a tile: dx, dy, and the step's
 * length (1 straight, SQRT2 diagonal).
 */
export const NEIGHBORS: [number, number, number][] = [
  [1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
  [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2],
];
