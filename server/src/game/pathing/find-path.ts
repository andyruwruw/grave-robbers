// Local Imports
import { NEIGHBORS } from './config/neighbors';
import { octile } from './helpers/octile';
import { MinHeap } from './min-heap';

// Types
import type { SearchOptions, Step } from './types/path';

/**
 * Scratch space shared by every search, grown to the biggest map seen.
 * Instead of clearing it, each search bumps `search` and a tile's entries
 * only count where `seenIn` (and `closedIn`) match it.
 */
let gScore = new Float64Array(0);

/**
 * The tile each tile was reached from (-1 for the start).
 */
let cameFrom = new Int32Array(0);

/**
 * The search that last reached each tile.
 */
let seenIn = new Uint32Array(0);

/**
 * The search that last finished each tile.
 */
let closedIn = new Uint32Array(0);

/**
 * The current search's number.
 */
let search = 0;

/**
 * Makes the scratch space fit a map and starts a new search on it.
 * @param size The map's tile count.
 */
function scratch(size: number): void {
  if (gScore.length < size) {
    gScore = new Float64Array(size);
    cameFrom = new Int32Array(size);
    seenIn = new Uint32Array(size);
    closedIn = new Uint32Array(size);
    search = 0;
  }
  search++;
}

/**
 * A* (with `to`) or Dijkstra (without) over the tile grid, 8-way, never
 * cutting the corner of a closed tile (or one that can't be stepped onto).
 * @param opts What to walk through and where to head.
 * @returns The steps after `from`, or null if nothing acceptable is
 * reachable.
 */
export function findPath(opts: SearchOptions): Step[] | null {
  const { from, to, cost, open, score, accept, width, height, within } = opts;
  scratch(width * height);
  const minX = within === undefined ? 0 : Math.max(0, from.tx - within);
  const minY = within === undefined ? 0 : Math.max(0, from.ty - within);
  const maxX = within === undefined ? width - 1 : Math.min(width - 1, from.tx + within);
  const maxY = within === undefined ? height - 1 : Math.min(height - 1, from.ty + within);
  const g = (i: number): number => (seenIn[i] === search ? gScore[i] : Infinity);
  const start = from.ty * width + from.tx;
  const goal = to ? to.ty * width + to.tx : -1;
  gScore[start] = 0;
  seenIn[start] = search;
  cameFrom[start] = -1;
  const heap = new MinHeap();
  heap.push(start, to ? octile(from.tx, from.ty, to.tx, to.ty) : 0);
  let best = -1;
  let bestScore = Infinity;

  while (heap.size > 0) {
    const i = heap.pop();
    if (closedIn[i] === search) {
      continue;
    }
    closedIn[i] = search;
    const x = i % width;
    const y = (i - x) / width;
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
      if (nx < minX || ny < minY || nx > maxX || ny > maxY) {
        continue;
      }
      if (dx !== 0 && dy !== 0 && !(open(nx, ny) && open(x + dx, y) && open(x, y + dy) && cost(x + dx, y, x, y) < Infinity && cost(x, y + dy, x, y) < Infinity)) {
        continue;
      }
      const n = ny * width + nx;
      if (closedIn[n] === search) {
        continue;
      }
      const next = g(i) + len * cost(nx, ny, x, y);
      if (next < g(n)) {
        gScore[n] = next;
        seenIn[n] = search;
        cameFrom[n] = i;
        heap.push(n, to ? next + octile(nx, ny, to.tx, to.ty) : next);
      }
    }
  }

  if (best === -1 || best === start) {
    return best === start ? [] : null;
  }
  const path: Step[] = [];
  for (let i = best; i !== start; i = cameFrom[i]) {
    path.push({ tx: i % width, ty: Math.floor(i / width) });
  }
  return path.reverse();
}
