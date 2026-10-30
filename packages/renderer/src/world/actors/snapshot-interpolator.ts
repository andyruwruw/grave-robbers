// Local Imports
import { ScenePart } from '../scene-part';
import { TRAIL_KEEP } from './config/actors';

/**
 * Draws everyone a little in the past, blended between snapshots, for a
 * smooth picture over a jittery connection.
 */
export class SnapshotInterpolator extends ScenePart {
  /**
   * How far in the past (seconds) everyone else is drawn (0: chase the
   * latest snapshot).
   */
  delay = 0;

  /**
   * The recent positions the blend uses, by `p<id>`/`m<id>`, stamped on
   * arrival.
   */
  private _trails = new Map<string, { t: number; x: number; y: number }[]>();

  /**
   * The moment everyone is drawn at this frame.
   * @returns Seconds, on the `performance.now()` clock.
   */
  drawnAt(): number {
    return performance.now() / 1000 - this.delay;
  }

  /**
   * Notes where something was in a snapshot that arrived at `t`, keeping
   * about a second of them.
   * @param key The actor's key.
   * @param x Tile-space x.
   * @param y Tile-space y.
   * @param t Arrival time, in seconds.
   */
  record(key: string, x: number, y: number, t: number): void {
    let trail = this._trails.get(key);
    if (!trail) {
      trail = [];
      this._trails.set(key, trail);
    }
    trail.push({ t, x, y });
    while (trail.length > 2 && trail[0].t < t - TRAIL_KEEP) {
      trail.shift();
    }
  }

  /**
   * Where something was at time `t`, blended between the snapshots either
   * side (the nearest end when `t` is outside them).
   * @param key The actor's key.
   * @param t The time, in seconds.
   * @returns The position, or null with no snapshots.
   */
  sample(key: string, t: number): { x: number; y: number } | null {
    const trail = this._trails.get(key);
    if (!trail || trail.length === 0) {
      return null;
    }
    if (t <= trail[0].t) {
      return trail[0];
    }
    for (let i = 1; i < trail.length; i++) {
      const b = trail[i];
      if (t <= b.t) {
        const a = trail[i - 1];
        const k = (t - a.t) / Math.max(1e-6, b.t - a.t);
        return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
      }
    }
    return trail[trail.length - 1];
  }

  /**
   * Forgets an actor's positions once it's gone.
   * @param key The actor's key.
   */
  forget(key: string): void {
    this._trails.delete(key);
  }
}
