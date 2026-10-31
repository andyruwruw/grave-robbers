// Packages
import { steerOf } from '@halloween/shared/players/walk';
import { clampStyle } from '@halloween/shared/structures/wall-styles';

// Local Imports
import { GameSystem } from '../core/game-system';

/**
 * A phone's raw intent: the sticks, the buttons, turning, the look of the
 * wall being built, and its ping.
 */
export class ControlSystem extends GameSystem {
  /**
   * Stores the latest joystick vector, snapped to the nearest of eight
   * directions (so facing, and therefore targeting, is always a clean
   * neighbor tile) and clamped to the unit circle. Tilt still sets speed.
   * @param token The player's token.
   * @param x The stick across (-1 to 1).
   * @param y The stick down (-1 to 1).
   */
  setInput(token: string, x: number, y: number): void {
    const player = this.players.get(token);
    if (!player || !Number.isFinite(x) || !Number.isFinite(y)) {
      return;
    }
    const steer = steerOf(x, y);
    player.inputX = steer.x;
    player.inputY = steer.y;
  }

  /**
   * Holds or lets go of a player's Action button.
   * @param token The player's token.
   * @param down Whether the button is held.
   */
  setAction(token: string, down: boolean): void {
    const player = this.players.get(token);
    if (player) {
      player.actionHeld = down;
    }
  }

  /**
   * Holds or lets go of a player's Block button: they block while it's
   * held and they can (see `Player.canBlock`).
   * @param token The player's token.
   * @param down Whether the button is held.
   */
  setBlock(token: string, down: boolean): void {
    const player = this.players.get(token);
    if (player) {
      player.blockHeld = down;
      player.blocking = down && player.canBlock();
    }
  }

  /**
   * Where the Action stick points, snapped to one of eight directions like
   * movement (or any way at all when `free`, /play's mouse and right
   * stick), or (0, 0) when centered. While aiming, the player faces the aim
   * instead of where they walk, so they can strike behind themselves.
   * @param token The player's token.
   * @param x The stick across (-1 to 1).
   * @param y The stick down (-1 to 1).
   * @param free Whether to keep the exact direction instead of snapping.
   */
  setAim(token: string, x: number, y: number, free = false): void {
    const player = this.players.get(token);
    if (!player || !Number.isFinite(x) || !Number.isFinite(y)) {
      return;
    }
    if (x === 0 && y === 0) {
      player.aimX = 0;
      player.aimY = 0;
      return;
    }
    const exact = Math.atan2(y, x);
    const angle = free ? exact : Math.round(exact / (Math.PI / 4)) * (Math.PI / 4);
    player.aimX = Math.cos(angle);
    player.aimY = Math.sin(angle);
  }

  /**
   * A controller's measured round trip (ms), shown on the TV and used to
   * rewind monsters when its melee lands (`strike`).
   * @param token The player's token.
   * @param ms The round trip (ms).
   */
  setPing(token: string, ms: number): void {
    const p = this.players.get(token);
    if (p) {
      p.ping = ms;
    }
  }

  /**
   * Turns a quarter turn left (-1) or right (1): while building, the way
   * the next turned structure (a conveyor belt) will face, starting from
   * the player's facing; otherwise the player, snapped to the four sides.
   * @param token The player's token.
   * @param dir Which way: -1 left, 1 right.
   */
  turn(token: string, dir: -1 | 1): void {
    const p = this.players.get(token);
    if (!p || p.dead) {
      return;
    }
    if (p.buildSlot !== null) {
      p.buildFacing = (Math.round((p.buildFacing ?? p.facing) / (Math.PI / 2)) + dir) * (Math.PI / 2) % (Math.PI * 2);
      return;
    }
    p.facing = (Math.round(p.facing / (Math.PI / 2)) + dir) * (Math.PI / 2);
  }

  /**
   * Picks the look the wall being built goes down in (see `WALL_STYLES`),
   * kept for that wall until changed.
   * @param token The player's token.
   * @param style The look, kept to the ones the wall has.
   */
  pickStyle(token: string, style: number): void {
    const p = this.players.get(token);
    if (p?.building) {
      p.buildStyles[p.building] = clampStyle(p.building, style);
    }
  }
}
