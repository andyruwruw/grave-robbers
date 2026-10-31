/**
 * How a screen draws the world and its overlays. Every display (TV,
 * admin, /play, the phone) holds one; /play lets the player change it and
 * saves it, the others keep the defaults (`displayDefaults`). The renderer
 * applies it with `WorldRenderer.setDisplaySettings`; the overlay flags
 * (TPS, FPS, server ticks) are drawn by the app.
 */
export interface DisplaySettings {
  /**
   * Overall brightness, 1 as the game is drawn (capped well short of
   * washing the night out; see DISPLAY_RANGES).
   */
  brightness: number;

  /**
   * Scale of small details. Stored for now; what it scales is still to be
   * decided.
   */
  details: number;

  /**
   * The camera's elevation above the horizon, in degrees.
   */
  viewAngle: number;

  /**
   * Bloom around bright things, 0..1.
   */
  glow: number;

  /**
   * Red and blue fringing away from players, 0..1.
   */
  aberration: number;

  /**
   * Thickness of the ground fog, 0 (off) to 1.
   */
  fog: number;

  /**
   * How hard the screen shakes on hits, 0 (never) to 1.
   */
  shake: number;

  /**
   * The fastest a player's model turns to face where they aim, in radians
   * a second (see `PlayerTurn`).
   */
  turnSpeed: number;

  /**
   * How much blood shows, 0 (none at all: no gore, splats, or puddles) to 1.
   */
  blood: number;

  /**
   * Whether the candy and blood counts show in the top bar (the app draws
   * them; the renderer doesn't use this).
   */
  showResources: boolean;

  /**
   * Whether other players' names show over them.
   */
  showNames: boolean;

  /**
   * Whether this screen's own player's name shows over them.
   */
  showMyName: boolean;

  /**
   * Whether health bars show (other players', monsters', and things being
   * broken).
   */
  showHealthBars: boolean;

  /**
   * Whether this screen's own player's health bar shows.
   */
  showMyHealthBar: boolean;

  /**
   * Whether the server's ticks per second show in a corner.
   */
  showTps: boolean;

  /**
   * Whether this screen's frames per second show in a corner.
   */
  showFps: boolean;

  /**
   * Whether the server's tick time (ms per step) shows in a corner.
   */
  showServerTicks: boolean;
}

/**
 * The numeric display settings.
 */
export type DisplayNumber = 'brightness' | 'details' | 'viewAngle' | 'glow' | 'aberration' | 'fog' | 'shake' | 'turnSpeed' | 'blood';

/**
 * The on/off display settings.
 */
export type DisplayFlag = Exclude<keyof DisplaySettings, DisplayNumber>;
