/**
 * A thrown glaive's flight (Soulbound and Wraith Glaive): straight out,
 * then back to its thrower along a curve that can swing out sideways.
 */
export interface GlaiveFlight {
  /**
   * On its way back.
   */
  returning: boolean;

  /**
   * Where it turned back (tiles).
   */
  fromX: number;

  /**
   * Where it turned back (tiles).
   */
  fromY: number;

  /**
   * How far the curve's control point sits off the straight way back
   * (tiles across); twice the bulge at its widest.
   */
  sideX: number;

  /**
   * How far the curve's control point sits off the straight way back
   * (tiles down).
   */
  sideY: number;

  /**
   * How far along the way back it is, 0 to 1.
   */
  t: number;

  /**
   * Tiles it swings out sideways on the way back (the throw's `arc`).
   */
  arc: number;

  /**
   * When it's caught whatever happens (game clock).
   */
  until: number;
}
