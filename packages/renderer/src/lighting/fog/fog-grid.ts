// Local Imports
import {
  CELLS_PER_TILE,
  DENSITY_RANGE,
  DIFFUSION,
  SETTLE_TIME,
} from './config/fog';
import { FogField } from './fog-field';

// Types
import type { FogStamp } from '../../types/effects';

/**
 * The fog's density simulation over its field: it settles toward the
 * resting shape, never enters tall objects, and flows around them.
 * Disturbances push, drag, thin and thicken it.
 */
export class FogGrid extends FogField {
  /**
   * One simulation step: disturbances, flow, then blending and settling.
   * @param dt Seconds since the last frame.
   * @param stamps This frame's disturbances.
   */
  step(dt: number, stamps: FogStamp[]): void {
    this.applyStamps(dt, stamps);
    this.flow(dt);
    this.settle(dt);
  }

  /**
   * Applies this frame's disturbances. A push lifts fog out of its radius
   * and piles it in a ring just outside, only on open cells it could reach
   * in a straight line (so it heaps up beside walls instead of entering or
   * jumping them); drag fills the flow field for
   * `flow`; burn and add thin and thicken in place.
   * @param dt Seconds since the last frame.
   * @param stamps This frame's disturbances.
   */
  private applyStamps(dt: number, stamps: FogStamp[]): void {
    const { width, height, _density: density, _blocked: blocked, _vx: vx, _vy: vy } = this;
    vx.fill(0);
    vy.fill(0);
    for (const s of stamps) {
      const cx = s.x * CELLS_PER_TILE;
      const cy = s.y * CELLS_PER_TILE;
      const r = s.radius * CELLS_PER_TILE;
      const outer = r + (s.push ? CELLS_PER_TILE : 0);
      const ring: number[] = [];
      let lifted = 0;
      const x0 = Math.max(0, Math.floor(cx - outer));
      const x1 = Math.min(width - 1, Math.ceil(cx + outer));
      const y0 = Math.max(0, Math.floor(cy - outer));
      const y1 = Math.min(height - 1, Math.ceil(cy + outer));
      let walled = false;
      for (let y = y0; y <= y1 && !walled; y++) {
        for (let x = x0; x <= x1 && !walled; x++) {
          walled = blocked[y * width + x] === 1;
        }
      }
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          const i = y * width + x;
          if (blocked[i]) {
            continue;
          }
          const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
          if (d >= r) {
            if (s.push && d < outer && (!walled || this.reachable(cx, cy, x + 0.5, y + 0.5))) {
              ring.push(i);
            }
            continue;
          }
          const f = 1 - d / r;
          const w = f * f * (3 - 2 * f);
          if (s.push) {
            const take = density[i] * Math.min(1, s.push * w * dt);
            density[i] -= take;
            lifted += take;
          }
          if (s.vx || s.vy) {
            vx[i] += (s.vx ?? 0) * w;
            vy[i] += (s.vy ?? 0) * w;
          }
          if (s.burn) {
            density[i] = Math.max(0, density[i] - s.burn * w * dt);
          }
          if (s.add) {
            density[i] = Math.min(DENSITY_RANGE, density[i] + s.add * w * dt);
          }
        }
      }
      if (ring.length > 0) {
        const share = lifted / ring.length;
        for (const j of ring) {
          density[j] = Math.min(DENSITY_RANGE, density[j] + share);
        }
      }
    }
  }

  /**
   * Whether a straight line between two grid points stays out of tall
   * objects, so pushed fog only lands where it could have drifted to.
   * @param x0 Start x, in cells.
   * @param y0 Start y, in cells.
   * @param x1 End x, in cells.
   * @param y1 End y, in cells.
   * @returns Whether the line stays clear.
   */
  private reachable(x0: number, y0: number, x1: number, y1: number): boolean {
    const steps = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2);
    for (let k = 1; k < steps; k++) {
      const x = Math.floor(x0 + ((x1 - x0) * k) / steps);
      const y = Math.floor(y0 + ((y1 - y0) * k) / steps);
      if (this._blocked[y * this.width + x]) {
        return false;
      }
    }
    return true;
  }

  /**
   * Moves fog along the drag field (semi-Lagrangian: each cell pulls from
   * where its fog came from), never sourcing from inside a tall object, so
   * fog dragged toward a wall slides along it instead of through.
   * @param dt Seconds since the last frame.
   */
  private flow(dt: number): void {
    const { width, height, _density: density, _next: next, _blocked: blocked, _vx: vx, _vy: vy } = this;
    next.set(density);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x;
        if (blocked[i] || (vx[i] === 0 && vy[i] === 0)) {
          continue;
        }
        const sx = Math.min(width - 1.001, Math.max(0, x - vx[i] * CELLS_PER_TILE * dt));
        const sy = Math.min(height - 1.001, Math.max(0, y - vy[i] * CELLS_PER_TILE * dt));
        const x0 = Math.floor(sx);
        const y0 = Math.floor(sy);
        const fx = sx - x0;
        const fy = sy - y0;
        let sum = 0;
        let weight = 0;
        for (const [ox, oy, w] of [[0, 0, (1 - fx) * (1 - fy)], [1, 0, fx * (1 - fy)], [0, 1, (1 - fx) * fy], [1, 1, fx * fy]] as const) {
          const j = (y0 + oy) * width + x0 + ox;
          if (!blocked[j]) {
            sum += density[j] * w;
            weight += w;
          }
        }
        if (weight > 0) {
          next[i] = sum / weight;
        }
      }
    }
    this._density.set(next);
  }

  /**
   * Blends each open cell with its open neighbors (fog spreads around
   * corners, not through walls) and eases it back toward its resting shape.
   * @param dt Seconds since the last frame.
   */
  private settle(dt: number): void {
    const { width, height, _density: density, _next: next, _rest: rest, _blocked: blocked } = this;
    const ease = 1 - Math.exp(-dt / SETTLE_TIME);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x;
        if (blocked[i]) {
          next[i] = 0;
          continue;
        }
        let sum = 0;
        let n = 0;
        if (x > 0 && !blocked[i - 1]) {
          sum += density[i - 1];
          n++;
        }
        if (x < width - 1 && !blocked[i + 1]) {
          sum += density[i + 1];
          n++;
        }
        if (y > 0 && !blocked[i - width]) {
          sum += density[i - width];
          n++;
        }
        if (y < height - 1 && !blocked[i + width]) {
          sum += density[i + width];
          n++;
        }
        const mixed = n > 0 ? density[i] + (sum / n - density[i]) * DIFFUSION : density[i];
        next[i] = mixed + (rest[i] - mixed) * ease;
      }
    }
    this._density.set(next);
  }
}
