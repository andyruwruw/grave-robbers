// Packages
import {
  PANIC_RANGE,
  PANIC_RETURN_SECONDS,
  PANIC_SECONDS,
  PLAYER_SPEED,
} from '@halloween/shared/players/movement';

// Local Imports
import { GameSystem } from '../core/game-system';
import { findPath } from '../pathing/find-path';
import { PANIC_REPLAN, PANIC_SAFE } from './config/movement';

// Types
import type { Player } from '../players/player';

/**
 * The phone's Panic button: running from nearby monsters, then walking
 * back home.
 */
export class PanicSystem extends GameSystem {
  /**
   * Starts a panic: the player runs from monsters close by for a moment,
   * then walks back.
   * @param token The player's token.
   */
  panic(token: string): void {
    const p = this.players.get(token);
    if (p && !p.dead) {
      p.panic = { until: this.world.time + PANIC_SECONDS, homeX: p.x, homeY: p.y, path: [], planAt: 0 };
    }
  }

  /**
   * The direction a panicking player is steered in instead of their
   * joystick. While panicking, along a path to the nearby tile furthest
   * from every monster in range (the search walks around walls, so a dead
   * end doesn't trap them); afterwards along a path back home, fleeing
   * again whenever a monster comes within three quarters of that range. Paths are
   * replanned a few times a second as monsters move. Clears the panic once
   * home or out of time.
   * @param p The player.
   * @returns The steer vector (each axis -1 to 1).
   */
  panicSteer(p: Player): { x: number; y: number } {
    const panic = p.panic!;
    const time = this.world.time;
    const fleeing = time < panic.until;
    const near = this.horde.bodies().filter((m): boolean => Math.hypot(p.x - m.x, p.y - m.y) < (fleeing ? PANIC_RANGE : PANIC_RANGE * 0.75));
    const home = Math.hypot(panic.homeX - p.x, panic.homeY - p.y);
    if (!fleeing && (time > panic.until + PANIC_RETURN_SECONDS || (near.length === 0 && home < 0.15))) {
      p.panic = null;
      return { x: 0, y: 0 };
    }
    if (fleeing && near.length === 0) {
      return { x: 0, y: 0 };
    }
    if (time >= panic.planAt) {
      panic.planAt = time + PANIC_REPLAN;
      const map = this.world.map;
      const gap = (tx: number, ty: number): number => Math.min(...near.map((m): number => Math.hypot(tx + 0.5 - m.x, ty + 0.5 - m.y)));
      const from = { tx: Math.floor(p.x), ty: Math.floor(p.y) };
      const options = {
        from,
        cost: (tx: number, ty: number, fx: number, fy: number): number =>
          (map.isSolid(tx, ty) || !map.canStep(fx, fy, tx, ty) ? Infinity : near.length > 0 && gap(tx, ty) < 1.2 ? 12 : 1),
        open: (tx: number, ty: number): boolean => !map.isSolid(tx, ty),
      };
      panic.path = near.length > 0
        ? findPath({ width: this.world.map.width, height: this.world.map.height, ...options, score: (tx: number, ty: number): number => -Math.min(gap(tx, ty), PANIC_SAFE) + Math.hypot(tx - from.tx, ty - from.ty) * 0.15 }) ?? []
        : findPath({ width: this.world.map.width, height: this.world.map.height, ...options, to: { tx: Math.floor(panic.homeX), ty: Math.floor(panic.homeY) } }) ?? [];
    }
    while (panic.path.length > 0 && Math.hypot(panic.path[0].tx + 0.5 - p.x, panic.path[0].ty + 0.5 - p.y) < 0.35) {
      panic.path.shift();
    }
    const target = panic.path[0] ? { x: panic.path[0].tx + 0.5, y: panic.path[0].ty + 0.5 } : near.length === 0 ? { x: panic.homeX, y: panic.homeY } : null;
    if (!target) {
      return { x: 0, y: 0 };
    }
    const dx = target.x - p.x;
    const dy = target.y - p.y;
    const d = Math.hypot(dx, dy);
    if (d < 0.01) {
      return { x: 0, y: 0 };
    }
    const speed = panic.path.length > 1 ? 1 : Math.min(1, d / (PLAYER_SPEED * 0.1));
    return { x: (dx / d) * speed, y: (dy / d) * speed };
  }
}
