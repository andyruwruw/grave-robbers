// Packages
import { HUGE_SIZE } from '@halloween/shared/world/dimensions';

/**
 * Smooth value noise in 0..1 on a seeded lattice `scale` tiles apart.
 * @param rand The PRNG the lattice is drawn from.
 * @param scale Tiles between lattice points.
 * @returns The noise at a tile.
 */
export function noise(rand: () => number, scale: number): (x: number, y: number) => number {
  const size = Math.ceil(HUGE_SIZE / scale) + 2;
  const lattice = Float32Array.from({ length: size * size }, rand);
  const at = (ix: number, iy: number): number => lattice[iy * size + ix];
  return (x: number, y: number): number => {
    const fx = x / scale;
    const fy = y / scale;
    const ix = Math.floor(fx);
    const iy = Math.floor(fy);
    const u = fx - ix;
    const v = fy - iy;
    const su = u * u * (3 - 2 * u);
    const sv = v * v * (3 - 2 * v);
    const top = at(ix, iy) + (at(ix + 1, iy) - at(ix, iy)) * su;
    const bottom = at(ix, iy + 1) + (at(ix + 1, iy + 1) - at(ix, iy + 1)) * su;
    return top + (bottom - top) * sv;
  };
}
