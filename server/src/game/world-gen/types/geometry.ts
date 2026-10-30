/**
 * An axis-aligned tile rectangle.
 */
export interface Rect {
  /**
   * The left column.
   */
  x: number;

  /**
   * The top row.
   */
  y: number;

  /**
   * Width in tiles.
   */
  w: number;

  /**
   * Height in tiles.
   */
  h: number;
}

/**
 * A tile as [column, row].
 */
export type Point = [number, number];
