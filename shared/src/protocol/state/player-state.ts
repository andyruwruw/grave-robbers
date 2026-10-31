// Types
import type { GearKind, GearSlot } from '../../gear/types/gear-def';
import type { Infusion } from '../../gear/types/infusion';
import type { StructureKind } from '../../structures/types/structures';

/**
 * Wire protocol between the server, the TV display, and phone controllers.
 * Every message is a JSON object discriminated by `t`.
 */

/**
 * A player as the server broadcasts it.
 */
export interface PlayerState {
  /**
   * Stable public id (never the secret token).
   */
  id: string;

  /**
   * Display name chosen on the phone.
   */
  name: string;

  /**
   * Body color, one of PLAYER_COLORS.
   */
  color: string;

  /**
   * World position in tiles (x east, y south).
   */
  x: number;

  /**
   * World position in tiles (x east, y south).
   */
  y: number;

  /**
   * Facing angle in radians, 0 = east, PI/2 = south.
   */
  facing: number;

  /**
   * Whether the player is currently moving.
   */
  moving: boolean;

  /**
   * Slowed by a ghost's ectoplasm.
   */
  slowed: boolean;

  /**
   * Picked up by the TV's mouse.
   */
  lifted: boolean;

  /**
   * Whether the phone is currently connected.
   */
  connected: boolean;

  /**
   * Swing counter; the display animates a swing whenever it goes up.
   */
  swings: number;

  /**
   * Structure picked from the bag to place, previewed on the facing tile.
   */
  building: StructureKind | null;

  /**
   * While building: the point the mouse aims the build at (null to use
   * the facing tile, see `buildTarget`), and the way a turned structure
   * (a conveyor belt) will face, as an angle (null: the player's facing).
   */
  buildAim: { x: number; y: number } | null;

  /**
   * The way a turned structure will face, as an angle (null: the player's
   * facing).
   */
  buildFacing: number | null;

  /**
   * The look the wall being built goes down in (see `WALL_STYLES`), 0 for
   * anything else.
   */
  buildStyle: number;

  /**
   * Health, 0..MAX_HP (fractional while regenerating).
   */
  hp: number;

  /**
   * Health lost to damage too fresh to heal yet, above `hp`.
   */
  wounded: number;

  /**
   * Hit counter; the display flashes the player whenever it goes up.
   */
  hurts: number;

  /**
   * Waiting to respawn; hidden on the display.
   */
  dead: boolean;

  /**
   * Under spawn protection: can't be hurt.
   */
  protected: boolean;

  /**
   * Holding their shield up.
   */
  blocking: boolean;

  /**
   * Taking aim with a crossbow, and the monster it's locked onto (shown
   * with a dim target over its head), if any.
   */
  aiming: boolean;

  /**
   * The monster a crossbow is locked onto, if any.
   */
  aimTarget: number | null;

  /**
   * Which step of a combo the latest swing was (-1: none; SUPER_COMBO: a
   * charged gauntlet's super uppercut), how charged a gauntlet is (0 to
   * 1), and reloading a crossbow.
   */
  combo: number;

  /**
   * How charged a gauntlet is, 0 to 1.
   */
  charge: number;

  /**
   * Reloading a crossbow.
   */
  reloading: boolean;

  /**
   * Something drawn for a moment in place of the weapon: the hammer for a
   * job (gathering, digging, building), or a stake from the bag for a
   * vampire.
   */
  drawn: GearKind | null;

  /**
   * Digging a grave: the job swing shows a spade stabbed into the ground
   * and dirt tossed over the shoulder instead of the hammer.
   */
  digging: boolean;

  /**
   * Round trip to this player's controller in ms (smoothed), or null until
   * it's been measured.
   */
  ping: number | null;

  /**
   * What's equipped in each slot (null: the hammer, the lantern, no
   * armor).
   */
  gear: Record<GearSlot, GearKind | null>;

  /**
   * The infusion of what's equipped in each slot, for slots holding an
   * infused item (absent for plain ones): with `gear` it names each
   * variant, for its model.
   */
  gearInfusion: Partial<Record<GearSlot, Infusion>>;

  /**
   * Their glaive is out, thrown (Soulbound and Wraith Glaive): the avatar
   * hides it until it's back. Absent until the server sets it.
   */
  thrown?: boolean;

  /**
   * Extra health above full from overheal (Heart Devourer, Death's
   * Harvest). Absent or 0 for none.
   */
  overheal?: number;

  /**
   * Their Moonsilver Saber is recharging its one-shot (the blade dims).
   * Absent until the server sets it.
   */
  dimmed?: boolean;

  /**
   * Their latest melee swing skipped its windup (Headsman's Axe after a
   * multi-kill): the avatar plays it at the plain pace. Absent otherwise.
   */
  quickSwing?: boolean;
}

/**
 * The private identity a controller keeps to rejoin as the same player.
 */
export interface PlayerIdentity {
  /**
   * Secret token, stored on the phone.
   */
  token: string;

  /**
   * Public state at the time of joining.
   */
  player: PlayerState;
}
