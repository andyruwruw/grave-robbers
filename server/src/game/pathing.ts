// Packages
import { MAP_HEIGHT, MAP_WIDTH } from '@halloween/shared/world';

/**
 * A tile on a path.
 */
export interface Step {
  tx: number;
  ty: number;
}

/**
 * What a search may walk through and where it's heading.
 */
export interface SearchOptions {
  from: Step;

  /**
   * Cost of entering a tile from its neighbor (fx, fy); Infinity means it
   * can't be entered that way.
   */
  cost: (tx: number, ty: number, fx: number, fy: number) => number;

  /**
   * Whether a tile is open enough to cut its corner on a diagonal step.
   */
  open: (tx: number, ty: number) => boolean;

  /**
   * The tile to reach. Without one, the search floods every reachable tile
   * and heads for the best `score` instead.
   */
  to?: Step;

  /**
   * Lower is better. Picks the destination when there's no `to`, or when
   * `to` can't be reached.
   */
  score?: (tx: number, ty: number) => number;

  /**
   * Stop at the first tile that satisfies this (for "nearest X" searches).
   */
  accept?: (tx: number, ty: number) => boolean;
}

const NEIGHBORS: [number, number, number][] = [
  [1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
  [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2],
];

const SIZE = MAP_WIDTH * MAP_HEIGHT;
const gScore = new Float64Array(SIZE);
const cameFrom = new Int32Array(SIZE);
const closed = new Uint8Array(SIZE);

/**
 * Binary min-heap of tile indices keyed by f-score.
 */
class Heap {
  private items: number[] = [];
  private keys: number[] = [];

  get size(): number {
    return this.items.length;
  }

  push(item: number, key: number): void {
    const { items, keys } = this;
    let i = items.length;
    items.push(item);
    keys.push(key);
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (keys[parent] <= key) {
        break;
      }
      items[i] = items[parent];
      keys[i] = keys[parent];
      i = parent;
    }
    items[i] = item;
    keys[i] = key;
  }

  pop(): number {
    const { items, keys } = this;
    const top = items[0];
    const lastItem = items.pop()!;
    const lastKey = keys.pop()!;
    if (items.length > 0) {
      let i = 0;
      for (;;) {
        const l = i * 2 + 1;
        const r = l + 1;
        let m = i;
        let mKey = lastKey;
        if (l < items.length && keys[l] < mKey) {
          m = l;
          mKey = keys[l];
        }
        if (r < items.length && keys[r] < mKey) {
          m = r;
        }
        if (m === i) {
          break;
        }
        items[i] = items[m];
        keys[i] = keys[m];
        i = m;
      }
      items[i] = lastItem;
      keys[i] = lastKey;
    }
    return top;
  }
}

/**
 * Octile distance, the exact cost of an open 8-way walk.
 */
function octile(ax: number, ay: number, bx: number, by: number): number {
  const dx = Math.abs(ax - bx);
  const dy = Math.abs(ay - by);
  return Math.max(dx, dy) + (Math.SQRT2 - 1) * Math.min(dx, dy);
}

/**
 * A* (with `to`) or Dijkstra (without) over the tile grid, 8-way, never
 * cutting the corner of a closed tile (or one that can't be stepped onto). Returns the steps after `from`, or
 * null if nothing acceptable is reachable.
 */
export function findPath(opts: SearchOptions): Step[] | null {
  const { from, to, cost, open, score, accept } = opts;
  gScore.fill(Infinity);
  closed.fill(0);
  const start = from.ty * MAP_WIDTH + from.tx;
  const goal = to ? to.ty * MAP_WIDTH + to.tx : -1;
  gScore[start] = 0;
  cameFrom[start] = -1;
  const heap = new Heap();
  heap.push(start, to ? octile(from.tx, from.ty, to.tx, to.ty) : 0);
  let best = -1;
  let bestScore = Infinity;

  while (heap.size > 0) {
    const i = heap.pop();
    if (closed[i]) {
      continue;
    }
    closed[i] = 1;
    const x = i % MAP_WIDTH;
    const y = (i - x) / MAP_WIDTH;
    if (i === goal || (accept && i !== start && accept(x, y))) {
      best = i;
      break;
    }
    if (score) {
      const s = score(x, y);
      if (s < bestScore) {
        bestScore = s;
        best = i;
      }
    }
    for (const [dx, dy, len] of NEIGHBORS) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= MAP_WIDTH || ny >= MAP_HEIGHT) {
        continue;
      }
      if (dx !== 0 && dy !== 0 && !(open(nx, ny) && open(x + dx, y) && open(x, y + dy) && cost(x + dx, y, x, y) < Infinity && cost(x, y + dy, x, y) < Infinity)) {
        continue;
      }
      const n = ny * MAP_WIDTH + nx;
      if (closed[n]) {
        continue;
      }
      const g = gScore[i] + len * cost(nx, ny, x, y);
      if (g < gScore[n]) {
        gScore[n] = g;
        cameFrom[n] = i;
        heap.push(n, to ? g + octile(nx, ny, to.tx, to.ty) : g);
      }
    }
  }

  if (best === -1 || best === start) {
    return best === start ? [] : null;
  }
  const path: Step[] = [];
  for (let i = best; i !== start; i = cameFrom[i]) {
    path.push({ tx: i % MAP_WIDTH, ty: Math.floor(i / MAP_WIDTH) });
  }
  return path.reverse();
}
