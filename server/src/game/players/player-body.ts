// Types
import type { Step } from '../pathing/types/path';
import type { PlayerInit } from '../types/players';

/**
 * A player's body and connection: who they are, where they stand, the
 * phone's raw input, and what's pushing them around.
 */
export class PlayerBody {
  /**
   * Stable public id (never the secret token).
   */
  id: string;

  /**
   * Secret token the phone keeps to rejoin as this player.
   */
  token: string;

  /**
   * Display name chosen on the phone.
   */
  name: string;

  /**
   * Body color, one of PLAYER_COLORS.
   */
  color: string;

  /**
   * World position in tiles (x east).
   */
  x: number;

  /**
   * World position in tiles (y south).
   */
  y: number;

  /**
   * Facing angle in radians, 0 = east, PI/2 = south.
   */
  facing = Math.PI / 2;

  /**
   * Whether they moved this tick.
   */
  moving = false;

  /**
   * Whether the phone is connected.
   */
  connected = true;

  /**
   * When the phone went away (wall clock ms), or null while connected.
   */
  disconnectedAt: number | null = null;

  /**
   * Round trip to their controller in ms, or null until it's measured.
   */
  ping: number | null = null;

  /**
   * Held up by the TV's mouse: frozen in place until dropped.
   */
  lifted = false;

  /**
   * The joystick, snapped to eight directions (x).
   */
  inputX = 0;

  /**
   * The joystick, snapped to eight directions (y).
   */
  inputY = 0;

  /**
   * Where the Action stick points (x), or 0 when centered.
   */
  aimX = 0;

  /**
   * Where the Action stick points (y), or 0 when centered.
   */
  aimY = 0;

  /**
   * The phone's Action button is held.
   */
  actionHeld = false;

  /**
   * The phone's Block button is held; they actually block (`blocking`)
   * while it is and they have a shield up beside a one-handed weapon.
   */
  blockHeld = false;

  /**
   * Knockback speed (tiles per second, x).
   */
  knockX = 0;

  /**
   * Knockback speed (tiles per second, y).
   */
  knockY = 0;

  /**
   * Until when knockback moves them (game clock).
   */
  knockUntil = 0;

  /**
   * Until when a ghost's ectoplasm slows them down.
   */
  slowUntil = 0;

  /**
   * Running from monsters after the phone's Panic button: until when, and
   * the spot to walk back to afterwards.
   */
  panic: { until: number; homeX: number; homeY: number; path: Step[]; planAt: number } | null = null;

  /**
   * Sets up a body at a spawn point.
   * @param init Who they are and where they start.
   */
  constructor(init: PlayerInit) {
    this.id = init.id;
    this.token = init.token;
    this.name = init.name;
    this.color = init.color;
    this.x = init.x;
    this.y = init.y;
  }
}
