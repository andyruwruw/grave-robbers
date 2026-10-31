// Local Imports
import {
  HIGH_MAX,
  HIGH_SHARE,
  HILL_SCALE,
  HILL_WEIGHT,
  LAND_SCALE,
  LOW_MAX,
  LOW_SHARE,
  PAD_BLEND,
  GROUND_LEFT,
  PEAK_SHARE,
} from '../config/huge';
import { GenPass } from '../gen-pass';
import { TerracePass } from '../classic/passes/terrace-pass';
import { noise } from '../helpers/noise';
import { padOwners } from '../helpers/sites';

// Types
import type { Site } from '../types/sites';

/**
 * The lay of a huge world's land: hills, higher peaks, and hollows from
 * one height field over the whole map, with a flat pad under every site.
 */
export class HeightPass extends GenPass {
  /**
   * Two octaves of noise, cut into levels -1 to 2 at the shares the knobs
   * ask for (`mountains` and `mountainSize` raise ground, `peaks` raises
   * some of that again, `pits` and `pitSize` sink it; the two shrink
   * together if they'd take more than GROUND_LEFT of the world).
   * Each site's pad is
   * flattened to the level under its middle (the hub to the ground, a
   * watchtower hill no higher than the ground), easing back to the land
   * around it over PAD_BLEND tiles. Anything narrower than a shelf is
   * then flattened off, as on a classic map. Sets each site's `level`.
   * @param sites Every site.
   */
  heights(sites: Site[]): void {
    const n = this.map.width;
    const land = noise(this._canvas.rand, LAND_SCALE);
    const hills = noise(this._canvas.rand, HILL_SCALE);
    const field = new Float32Array(this.map.size);
    for (let i = 0; i < field.length; i++) {
      field[i] = land(i % n, Math.floor(i / n)) * (1 - HILL_WEIGHT) + hills(i % n, Math.floor(i / n)) * HILL_WEIGHT;
    }
    const sorted = Float32Array.from(field).sort();
    const at = (share: number): number => sorted[Math.min(sorted.length - 1, Math.max(0, Math.floor(share * sorted.length)))];
    const asked = { low: Math.min(LOW_MAX, LOW_SHARE * this.gen.pits * this.gen.pitSize), high: Math.min(HIGH_MAX, HIGH_SHARE * this.gen.mountains * this.gen.mountainSize) };
    const fit = Math.min(1, GROUND_LEFT / Math.max(1e-6, asked.low + asked.high));
    const low = asked.low * fit;
    const high = asked.high * fit;
    const peak = high * this.gen.peaks * PEAK_SHARE;
    const cuts = { low: low > 0 ? at(low) : -Infinity, high: high > 0 ? at(1 - high) : Infinity, peak: peak > 0 ? at(1 - peak) : Infinity };
    const middles = new Map<number, number>([[-1, at(low / 2)], [0, at((low + 1 - high) / 2)], [1, at(1 - (high + peak) / 2)], [2, at(1 - peak / 2)]]);
    const levelOf = (v: number): number => (v < cuts.low ? -1 : v >= cuts.peak ? 2 : v >= cuts.high ? 1 : 0);

    for (const site of sites) {
      const own = levelOf(field[this.map.index(Math.floor(site.x), Math.floor(site.y))]);
      site.level = site.kind === 'hub' ? 0 : site.kind === 'tower' ? Math.min(0, own) : own;
      const flat = middles.get(site.level)!;
      const reach = site.radius + PAD_BLEND;
      for (let y = Math.floor(site.y - reach); y <= site.y + reach; y++) {
        for (let x = Math.floor(site.x - reach); x <= site.x + reach; x++) {
          if (!this.map.inBounds(x, y)) {
            continue;
          }
          const d = Math.hypot(x + 0.5 - site.x, y + 0.5 - site.y);
          const t = Math.min(1, Math.max(0, (reach - d) / PAD_BLEND));
          const w = t * t * (3 - 2 * t);
          const i = this.map.index(x, y);
          field[i] = field[i] + (flat - field[i]) * w;
        }
      }
    }
    for (let i = 0; i < field.length; i++) {
      this.map.setLevel(i % n, Math.floor(i / n), levelOf(field[i]));
    }
    const owner = padOwners(this.map, sites);
    new TerracePass(this._canvas).shelve((x: number, y: number): boolean => owner[this.map.index(x, y)] < 0);
  }
}
