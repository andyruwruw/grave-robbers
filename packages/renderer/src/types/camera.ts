/**
 * How much a follow camera shows: tiles of ground top to bottom, or an
 * area of `w` x `h` tiles fitted to the screen the way a whole map is.
 */
export type FollowView = number | {
  /**
   * Tiles of ground across.
   */
  w: number;

  /**
   * Tiles of ground top to bottom.
   */
  h: number;
};
