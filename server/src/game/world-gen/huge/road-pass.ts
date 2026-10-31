// Local Imports
import {
  ROAD_BRIDGE,
  ROAD_CLIMB,
  ROAD_HASTE,
  ROAD_LOOPS,
  ROAD_LOOP_REACH,
  ROAD_REUSE,
  ROAD_STOP,
  ROAD_TRESPASS,
  ROAD_WIGGLE,
  ROAD_WIGGLE_SCALE,
} from '../config/huge';
import { GenPass } from '../gen-pass';
import { noise } from '../helpers/noise';
import { route } from '../helpers/route';
import { padOwners } from '../helpers/sites';

// Types
import type { Point } from '../types/geometry';
import type { Site } from '../types/sites';

/**
 * The roads joining a huge world's sites.
 */
export class RoadPass extends GenPass {
  /**
   * Joins the sites with winding 2-wide dirt roads (eight ways, so they
   * run on the slant too): a minimum spanning
   * tree of them first, then (ROAD_LOOPS chance each) a road from a site
   * to its nearest one not joined to it yet, within ROAD_LOOP_REACH. Each
   * road is the cheapest route between the two sites' nearest gates: it
   * wanders on a noise field, climbs one level at a time and only when it
   * must (straight up or down, never on the slant), bridges chasm when
   * that's much shorter, keeps out of other
   * sites, and follows roads already laid where it can. It stops
   * ROAD_STOP of the way into a landmark's pad, leaving it open.
   * @param sites Every site, levels set.
   * @returns Each road's tiles in order, site end first and last.
   */
  roads(sites: Site[]): Point[][] {
    const links = this.links(sites);
    const owner = padOwners(this.map, sites);
    const wiggle = noise(this._canvas.rand, ROAD_WIGGLE_SCALE);
    const wander = Float32Array.from({ length: this.map.size }, (_: unknown, i: number): number => wiggle(i % this.map.width, Math.floor(i / this.map.width)) * ROAD_WIGGLE);
    return links
      .map(([a, b]): Point[] | null => this.road(sites, a, b, owner, wander))
      .filter((r): r is Point[] => r !== null && r.length > 0);
  }

  /**
   * Which sites to join: a minimum spanning tree, then the loops.
   * @param sites Every site.
   * @returns Pairs of site indexes, the tree first.
   */
  private links(sites: Site[]): [number, number][] {
    const d = (a: number, b: number): number => Math.hypot(sites[a].x - sites[b].x, sites[a].y - sites[b].y);
    const out: [number, number][] = [];
    const joined = new Set([0]);
    while (joined.size < sites.length) {
      let best: [number, number] | null = null;
      for (const a of joined) {
        for (let b = 0; b < sites.length; b++) {
          if (!joined.has(b) && (!best || d(a, b) < d(...best))) {
            best = [a, b];
          }
        }
      }
      joined.add(best![1]);
      out.push(best!);
    }
    const linked = (a: number, b: number): boolean => out.some(([p, q]): boolean => (p === a && q === b) || (p === b && q === a));
    sites.forEach((_s: Site, a: number): void => {
      if (this.rand() >= ROAD_LOOPS) {
        return;
      }
      const near = sites
        .map((_t: Site, b: number): number => b)
        .filter((b: number): boolean => b !== a && !linked(a, b) && d(a, b) <= ROAD_LOOP_REACH)
        .sort((p: number, q: number): number => d(a, p) - d(a, q))[0];
      if (near !== undefined) {
        out.push([a, near]);
      }
    });
    return out;
  }

  /**
   * Routes and lays one road.
   * @param sites Every site.
   * @param a The index of the site it starts at.
   * @param b The index of the site it ends at.
   * @param owner Each tile's site index, or -1 off every pad.
   * @param wander Each tile's extra cost, so roads wander.
   * @returns The road's tiles laid, in order, or null if no route was found.
   */
  private road(sites: Site[], a: number, b: number, owner: Int16Array, wander: Float32Array): Point[] | null {
    const map = this.map;
    const gate = (s: Site, toward: { x: number; y: number }): Point =>
      s.gates.reduce((best: Point, g: Point): Point => (Math.hypot(g[0] - toward.x, g[1] - toward.y) < Math.hypot(best[0] - toward.x, best[1] - toward.y) ? g : best));
    const from = gate(sites[a], sites[b]);
    const to = gate(sites[b], { x: from[0], y: from[1] });
    const blocked = (x: number, y: number): boolean => map.get(x, y) !== 'chasm' && map.isSolid(x, y);
    const cost = (i: number, n: number): number => {
      const ix = i % map.width;
      const iy = Math.floor(i / map.width);
      const nx = n % map.width;
      const ny = Math.floor(n / map.width);
      const climb = Math.abs(map.level(ix, iy) - map.level(nx, ny));
      const diagonal = ix !== nx && iy !== ny;
      if (climb > 1 || blocked(nx, ny)) {
        return Infinity;
      }
      if (diagonal && (climb > 0 || blocked(ix, ny) || blocked(nx, iy) || map.level(ix, ny) !== map.level(ix, iy) || map.level(nx, iy) !== map.level(ix, iy))) {
        return Infinity;
      }
      const tile = map.get(nx, ny);
      const extra = (climb > 0 ? ROAD_CLIMB : 0) + (owner[n] >= 0 && owner[n] !== a && owner[n] !== b ? ROAD_TRESPASS : 0);
      const step = tile === 'path' || tile === 'cobble' || tile === 'spawn' ? ROAD_REUSE : 1 + wander[n] + (tile === 'chasm' ? ROAD_BRIDGE : 0);
      return (step + extra) * (diagonal ? Math.SQRT2 : 1);
    };
    const tiles = route(map.width, map.height, map.index(...from), map.index(...to), cost, ROAD_HASTE);
    if (!tiles) {
      return null;
    }
    const laid: Point[] = [];
    for (const i of tiles) {
      const x = i % map.width;
      const y = Math.floor(i / map.width);
      const short = [sites[a], sites[b]].some((s: Site): boolean => s.kind !== 'hub' && Math.hypot(x + 0.5 - s.x, y + 0.5 - s.y) < s.radius * ROAD_STOP);
      if (!short) {
        this.lay(x, y);
        laid.push([x, y]);
      }
    }
    return laid;
  }

  /**
   * Lays a 2-wide stretch of road at a tile: dirt on it and on whichever
   * of the three tiles past it (right, below, and between) are grass or
   * chasm at its level, bridging chasm at its level.
   * @param x The tile's column.
   * @param y The tile's row.
   */
  private lay(x: number, y: number): void {
    const level = this.map.level(x, y);
    for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
      const qx = x + dx;
      const qy = y + dy;
      const tile = this.map.get(qx, qy);
      const chasm = tile === 'chasm';
      if ((tile === 'grass' || chasm) && (dx + dy === 0 || chasm || this.map.level(qx, qy) === level)) {
        this.map.set(qx, qy, 'path');
        this.map.setLevel(qx, qy, level);
      }
    }
  }
}
