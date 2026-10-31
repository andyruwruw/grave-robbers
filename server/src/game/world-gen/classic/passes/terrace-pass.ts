// Local Imports
import { DIRS, HOLLOW_RADIUS, SHELF, TERRACE_CORE_SCALE, TERRACE_RADIUS } from '../../config/classic';
import { ClassicPass } from '../classic-pass';

// Types
import type { Point, Rect } from '../../types/geometry';

/**
 * Raised terraces and sunken hollows, kept to broad shelves.
 */
export class TerracePass extends ClassicPass {
  /**
   * Raised terraces (some with a higher core) and sunken hollows: noisy
   * blobs over open ground, kept off the fence, the crypt, the landmarks,
   * and the spawns. Anything narrower than SHELF is flattened back toward
   * the ground, then every path tile at the foot of a level change becomes
   * stairs.
   * @param spawns The spawn tiles to keep flat.
   */
  terraces(spawns: Point[]): void {
    const free = (tx: number, ty: number): boolean =>
      this.edge(tx, ty) >= 3
      && !this.reserved.some((r: Rect): boolean => tx >= r.x && tx < r.x + r.w && ty >= r.y && ty < r.y + r.h)
      && !spawns.some(([sx, sy]): boolean => Math.abs(sx - tx) <= 2 && Math.abs(sy - ty) <= 2);
    const blob = (cx: number, cy: number, radius: number, from: number, to: number): void => {
      const phase = this.rand() * Math.PI * 2;
      for (let ty = Math.floor(cy - radius - 1); ty <= cy + radius + 1; ty++) {
        for (let tx = Math.floor(cx - radius - 1); tx <= cx + radius + 1; tx++) {
          const angle = Math.atan2(ty + 0.5 - cy, tx + 0.5 - cx);
          const reach = radius * (0.8 + 0.25 * Math.sin(angle * 3 + phase));
          if (Math.hypot(tx + 0.5 - cx, ty + 0.5 - cy) < reach && free(tx, ty) && this.map.level(tx, ty) === from) {
            this.map.setLevel(tx, ty, to);
          }
        }
      }
    };
    const center = (): Point => {
      for (let tries = 0; ; tries++) {
        const c: Point = [6 + this.rand() * (this.map.width - 12), 5 + this.rand() * (this.map.height - 10)];
        if (tries > 50 || (free(Math.floor(c[0]), Math.floor(c[1])) && this.map.level(Math.floor(c[0]), Math.floor(c[1])) === 0)) {
          return c;
        }
      }
    };
    for (let i = 0; i < Math.round(this.gen.mountains); i++) {
      const [cx, cy] = center();
      const radius = (TERRACE_RADIUS[0] + this.rand() * (TERRACE_RADIUS[1] - TERRACE_RADIUS[0])) * this.gen.mountainSize;
      blob(cx, cy, radius, 0, 1);
      if (this.rand() < this.gen.peaks) {
        blob(cx, cy, radius * TERRACE_CORE_SCALE, 1, 2);
      }
    }
    for (let i = 0; i < Math.round(this.gen.pits); i++) {
      const [cx, cy] = center();
      blob(cx, cy, (HOLLOW_RADIUS[0] + this.rand() * (HOLLOW_RADIUS[1] - HOLLOW_RADIUS[0])) * this.gen.pitSize, 0, -1);
    }
    this.shelve(free);
    this.stairsOnPaths();
  }

  /**
   * Turns every path or cobble tile at the foot of a level change, with
   * path or cobble a level up beside it, into stairs.
   */
  stairsOnPaths(): void {
    for (let ty = 1; ty < this.map.height - 1; ty++) {
      for (let tx = 1; tx < this.map.width - 1; tx++) {
        const tile = this.map.get(tx, ty);
        if (tile !== 'path' && tile !== 'cobble') {
          continue;
        }
        const up = DIRS.some(([dx, dy]): boolean => {
          const n = this.map.get(tx + dx, ty + dy);
          return (n === 'path' || n === 'cobble') && this.map.level(tx + dx, ty + dy) === this.map.level(tx, ty) + 1;
        });
        if (up) {
          this.map.set(tx, ty, 'stairs');
        }
      }
    }
  }

  /**
   * Flattens anything raised or sunken that isn't part of a SHELF-wide
   * block at its level: each free tile drops (or rises) to the most any
   * block covering it supports, repeated until nothing changes.
   * @param free Whether a tile may change level.
   */
  shelve(free: (tx: number, ty: number) => boolean): void {
    for (let changed = true; changed;) {
      changed = false;
      const up = new Int8Array(this.map.size);
      const down = new Int8Array(this.map.size);
      for (let wy = 0; wy + SHELF <= this.map.height; wy++) {
        for (let wx = 0; wx + SHELF <= this.map.width; wx++) {
          let lo = Infinity;
          let hi = -Infinity;
          for (let y = wy; y < wy + SHELF; y++) {
            for (let x = wx; x < wx + SHELF; x++) {
              lo = Math.min(lo, this.map.level(x, y));
              hi = Math.max(hi, this.map.level(x, y));
            }
          }
          for (let y = wy; y < wy + SHELF; y++) {
            for (let x = wx; x < wx + SHELF; x++) {
              const i = y * this.map.width + x;
              up[i] = Math.max(up[i], lo);
              down[i] = Math.min(down[i], hi);
            }
          }
        }
      }
      for (let ty = 1; ty < this.map.height - 1; ty++) {
        for (let tx = 1; tx < this.map.width - 1; tx++) {
          const i = ty * this.map.width + tx;
          const level = this.map.level(tx, ty);
          const fixed = level > 0 ? Math.min(level, up[i]) : Math.max(level, down[i]);
          if (fixed !== level && free(tx, ty)) {
            this.map.setLevel(tx, ty, fixed);
            changed = true;
          }
        }
      }
    }
  }
}
