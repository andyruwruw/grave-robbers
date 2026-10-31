/**
 * A cheap eight-way route between two tiles of a grid (A*, its estimate
 * weighted by `least`, so not always the very cheapest when steps can
 * cost less).
 * @param width The grid's width.
 * @param height The grid's height.
 * @param from The start tile's index (row-major).
 * @param to The goal tile's index.
 * @param cost What a step from one tile index to the next costs (Infinity where it can't go).
 * @param least The least any step can cost, for the estimate toward the goal.
 * @returns Every tile index along the route, start first, or null if there's none.
 */
export function route(width: number, height: number, from: number, to: number, cost: (a: number, b: number) => number, least: number): number[] | null {
  const spent = new Float32Array(width * height).fill(Infinity);
  const came = new Int32Array(width * height).fill(-1);
  const done = new Uint8Array(width * height);
  const heap: number[] = [];
  const keys: number[] = [];
  const gx = to % width;
  const gy = Math.floor(to / width);
  const guess = (i: number): number => {
    const dx = Math.abs((i % width) - gx);
    const dy = Math.abs(Math.floor(i / width) - gy);
    return (Math.max(dx, dy) + (Math.SQRT2 - 1) * Math.min(dx, dy)) * least;
  };
  const push = (i: number, key: number): void => {
    heap.push(i);
    keys.push(key);
    for (let c = heap.length - 1; c > 0;) {
      const p = (c - 1) >> 1;
      if (keys[p] <= keys[c]) {
        break;
      }
      [heap[p], heap[c], keys[p], keys[c]] = [heap[c], heap[p], keys[c], keys[p]];
      c = p;
    }
  };
  const pop = (): number => {
    const top = heap[0];
    const lastI = heap.pop()!;
    const lastK = keys.pop()!;
    if (heap.length > 0) {
      heap[0] = lastI;
      keys[0] = lastK;
      for (let p = 0; ;) {
        const l = p * 2 + 1;
        const r = l + 1;
        let m = p;
        if (l < heap.length && keys[l] < keys[m]) {
          m = l;
        }
        if (r < heap.length && keys[r] < keys[m]) {
          m = r;
        }
        if (m === p) {
          break;
        }
        [heap[p], heap[m], keys[p], keys[m]] = [heap[m], heap[p], keys[m], keys[p]];
        p = m;
      }
    }
    return top;
  };

  spent[from] = 0;
  push(from, guess(from));
  while (heap.length > 0) {
    const i = pop();
    if (i === to) {
      const out = [i];
      for (let c = came[i]; c >= 0; c = came[c]) {
        out.push(c);
      }
      return out.reverse();
    }
    if (done[i]) {
      continue;
    }
    done[i] = 1;
    const x = i % width;
    const y = Math.floor(i / width);
    for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1], [x + 1, y + 1], [x - 1, y + 1], [x + 1, y - 1], [x - 1, y - 1]]) {
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) {
        continue;
      }
      const n = ny * width + nx;
      const step = cost(i, n);
      if (done[n] || step === Infinity || spent[i] + step >= spent[n]) {
        continue;
      }
      spent[n] = spent[i] + step;
      came[n] = i;
      push(n, spent[n] + guess(n));
    }
  }
  return null;
}
