/**
 * Something shot in flight: a crossbow bolt, or a gob of blood from a
 * blunderbuss or a sentry.
 */
export interface ShotState {
  /**
   * Unique id among the shots.
   */
  id: number;

  /**
   * Tile-space x.
   */
  x: number;

  /**
   * Tile-space y.
   */
  y: number;

  /**
   * Direction of travel in radians.
   */
  angle: number;

  /**
   * A crossbow bolt, a gob of blood (blunderbuss or sentry), a ghost's
   * ball of ectoplasm, a skeleton's arrow, or a witch's potion.
   */
  kind: 'bolt' | 'blood' | 'ecto' | 'arrow' | 'potion';

  /**
   * How far through its flight a lobbed potion is, 0 to 1 (for its arc).
   */
  lob?: number;
}

/**
 * A puddle a witch's potion left: where, and how much of its life is
 * left (1 fresh to 0 gone).
 */
export interface PuddleState {
  /**
   * Unique id among the puddles.
   */
  id: number;

  /**
   * Tile-space x.
   */
  x: number;

  /**
   * Tile-space y.
   */
  y: number;

  /**
   * How much of its life is left, 1 fresh to 0 gone.
   */
  life: number;
}

/**
 * A burning torch or campfire.
 */
export interface LightState {
  /**
   * Row-major tile index.
   */
  i: number;

  /**
   * Seconds of glow left, capped at LOW_FUEL (a light burns for good, so
   * only stations and altars ever run low).
   */
  fuel: number;

  /**
   * How far (tiles) and how bright it shines, with its builder's upgrades.
   */
  radius: number;

  /**
   * How bright it shines at its middle.
   */
  intensity: number;
}
