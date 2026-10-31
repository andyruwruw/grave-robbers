/**
 * A tile on a path.
 */
export interface Step {
  /**
   * The tile's column.
   */
  tx: number;

  /**
   * The tile's row.
   */
  ty: number;
}

/**
 * What a search may walk through and where it's heading.
 */
export interface SearchOptions {
  /**
   * The tile the search starts on.
   */
  from: Step;

  /**
   * The map's width in tiles.
   */
  width: number;

  /**
   * The map's height in tiles.
   */
  height: number;

  /**
   * Keeps the search within this many tiles of `from` (each way), so a
   * search on a huge map stays local. Unbounded without it.
   */
  within?: number;

  /**
   * Cost of entering a tile from its neighbor (fx, fy); Infinity means it
   * can't be entered that way.
   */
  cost: (tx: number, ty: number, fx: number, fy: number) => number;

  /**
   * Whether a tile is open enough to cut its corner on a diagonal step.
   */
  open: (tx: number, ty: number) => boolean;

  /**
   * The tile to reach. Without one, the search floods every reachable tile
   * and heads for the best `score` instead.
   */
  to?: Step;

  /**
   * Lower is better. Picks the destination when there's no `to`, or when
   * `to` can't be reached.
   */
  score?: (tx: number, ty: number) => number;

  /**
   * Stop at the first tile that satisfies this (for "nearest X" searches).
   */
  accept?: (tx: number, ty: number) => boolean;

  /**
   * Most tiles to look at before giving up: the search then ends at the
   * best `score`d tile it found so far (or finds nothing without a
   * `score`). Unset searches the whole area.
   */
  budget?: number;
}
