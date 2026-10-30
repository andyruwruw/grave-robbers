/**
 * Smooth value noise over the grid from a seeded lattice, 0..1.
 * @param rand The seeded PRNG the lattice is rolled from.
 * @param width Grid width, in cells.
 * @param height Grid height, in cells.
 * @param cell Cells between lattice points.
 * @returns The noise, one value per cell.
 */
export function latticeNoise(rand: () => number, width: number, height: number, cell: number): Float32Array {
  const lw = Math.ceil(width / cell) + 2;
  const lh = Math.ceil(height / cell) + 2;
  const lattice = Float32Array.from({ length: lw * lh }, rand);
  const out = new Float32Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const fx = x / cell;
      const fy = y / cell;
      const ix = Math.floor(fx);
      const iy = Math.floor(fy);
      const ux = (fx - ix) * (fx - ix) * (3 - 2 * (fx - ix));
      const uy = (fy - iy) * (fy - iy) * (3 - 2 * (fy - iy));
      const a = lattice[iy * lw + ix];
      const b = lattice[iy * lw + ix + 1];
      const c = lattice[(iy + 1) * lw + ix];
      const d = lattice[(iy + 1) * lw + ix + 1];
      out[y * width + x] = a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
    }
  }
  return out;
}
