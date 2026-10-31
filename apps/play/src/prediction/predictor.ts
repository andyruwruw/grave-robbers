// Packages
import { steerOf, walk, walkSpeed } from '@halloween/shared/players/walk';

// Local Imports
import {
  CORRECTION,
  ERROR_IGNORE,
  HISTORY_KEEP,
  SNAP_DISTANCE,
} from '../config/prediction';

// Types
import type { PlayerState } from '@halloween/shared/protocol/state/player-state';
import type { WorldMap } from '@halloween/shared/world/world-map';

/**
 * Moves /play's own player the moment a key or stick says so instead of a
 * round trip later. Each frame it walks the player with the server's own
 * rules (`steerOf`, `walkSpeed`, `walk`) and remembers where it put them.
 * When a snapshot arrives, it reflects input sent about one ping ago, so
 * it's compared with where the prediction had the player then; part of the
 * difference is fixed each snapshot (shifting the remembered path too, so
 * it isn't fixed twice), and a big one (knockback, a respawn) jumps
 * straight there.
 */
export class Predictor {
  /**
   * Where the prediction has the player, across.
   */
  x = 0;

  /**
   * Where the prediction has the player, down.
   */
  y = 0;

  /**
   * Which way the player faces, in radians.
   */
  facing = 0;

  /**
   * Whether the player is walking.
   */
  moving = false;

  /**
   * Whether the prediction has a starting point yet.
   */
  private _ready = false;

  /**
   * Where the prediction put the player each frame, oldest first.
   */
  private _history: { t: number; x: number; y: number }[] = [];

  /**
   * Takes the server's word for where the player is, forgetting the path
   * (dead, lifted, or just joined).
   *
   * @param me - The player as the server has them.
   */
  reset(me: PlayerState): void {
    this.x = me.x;
    this.y = me.y;
    this.facing = me.facing;
    this.moving = me.moving;
    this._history = [];
    this._ready = true;
  }

  /**
   * One frame of walking with the local `input` (a stick or WASD vector)
   * and turning toward `aim` when it isn't (0, 0).
   *
   * @param dt - Seconds since the last frame.
   * @param now - This frame's time in seconds.
   * @param map - The world map.
   * @param me - The player as the server last had them.
   * @param input - The walk vector.
   * @param aim - The aim vector.
   */
  step(dt: number, now: number, map: WorldMap, me: PlayerState, input: { x: number; y: number }, aim: { x: number; y: number }): void {
    if (!this._ready) {
      this.reset(me);
    }
    const steer = steerOf(input.x, input.y);
    this.moving = steer.x !== 0 || steer.y !== 0;
    if (this.moving) {
      const speed = walkSpeed(map, this.x, this.y, { slowed: me.slowed, blocking: me.blocking, bracing: false, reloading: me.reloading, armor: me.gear.armor });
      ({ x: this.x, y: this.y } = walk(map, this.x, this.y, steer.x * speed * dt, steer.y * speed * dt));
      this.facing = Math.atan2(steer.y, steer.x);
    }
    if (aim.x !== 0 || aim.y !== 0) {
      this.facing = Math.atan2(aim.y, aim.x);
    }
    this._history.push({ t: now, x: this.x, y: this.y });
    while (this._history.length > 2 && this._history[0].t < now - HISTORY_KEEP) {
      this._history.shift();
    }
  }

  /**
   * Checks a snapshot of the player against where the prediction had them
   * `lag` seconds ago (about one round trip) and nudges toward it.
   *
   * @param me - The player in the snapshot.
   * @param now - The arrival time in seconds.
   * @param lag - Seconds the snapshot lags the input.
   */
  reconcile(me: PlayerState, now: number, lag: number): void {
    const past = this.at(now - lag);
    if (!past) {
      this.reset(me);
      return;
    }
    const ex = me.x - past.x;
    const ey = me.y - past.y;
    const error = Math.hypot(ex, ey);
    if (error > SNAP_DISTANCE) {
      this.reset(me);
      return;
    }
    if (error < ERROR_IGNORE) {
      return;
    }
    const cx = ex * CORRECTION;
    const cy = ey * CORRECTION;
    this.x += cx;
    this.y += cy;
    for (const h of this._history) {
      h.x += cx;
      h.y += cy;
    }
  }

  /**
   * Where the prediction had the player at time `t`, between frames.
   *
   * @param t - The time in seconds.
   * @returns The position, or null with no history.
   */
  private at(t: number): { x: number; y: number } | null {
    const h = this._history;
    if (h.length === 0) {
      return null;
    }
    if (t <= h[0].t) {
      return h[0];
    }
    for (let i = 1; i < h.length; i++) {
      if (t <= h[i].t) {
        const a = h[i - 1];
        const b = h[i];
        const k = (t - a.t) / Math.max(1e-6, b.t - a.t);
        return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
      }
    }
    return h[h.length - 1];
  }
}
