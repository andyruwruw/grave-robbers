/**
 * A short burst of light from an effect (a blast, a nova, an infusing),
 * fading out over its life. Kept on `WorldContext.flashes` and lit by
 * `LightCollector`.
 */
export interface LightFlash {
  /**
   * Tile-space x.
   */
  x: number;

  /**
   * Tile-space y.
   */
  y: number;

  /**
   * How far it reaches, in tiles.
   */
  radius: number;

  /**
   * Its color, as hex.
   */
  color: string;

  /**
   * How bright it starts.
   */
  intensity: number;

  /**
   * When it went off, in clock seconds.
   */
  at: number;

  /**
   * Seconds it takes to fade out.
   */
  life: number;
}
