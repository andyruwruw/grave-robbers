/**
 * A light on the map, for monsters: where it is and how far it reaches
 * right now. `structure` lights burn fuel and can be snuffed.
 */
export interface ActiveLight {
  /**
   * The light's tile column.
   */
  tx: number;

  /**
   * The light's tile row.
   */
  ty: number;

  /**
   * How far it reaches right now, in tiles.
   */
  radius: number;

  /**
   * A built light that burns fuel and can be snuffed.
   */
  structure: boolean;
}

/**
 * How far and how bright a built light shines.
 */
export interface Shine {
  /**
   * How far it reaches, in tiles.
   */
  radius: number;

  /**
   * How bright it is.
   */
  intensity: number;
}

/**
 * A silver bell: its middle and how close ghosts may come.
 */
export interface Bell {
  /**
   * The bell's middle across, in tiles.
   */
  x: number;

  /**
   * The bell's middle down, in tiles.
   */
  y: number;

  /**
   * How close ghosts may come, in tiles.
   */
  radius: number;
}
