// Local Imports
import { MAP_HEIGHT, MAP_WIDTH } from '../../world/dimensions';

/**
 * The blue noise once built (see `blueNoise`), kept for the page or process.
 */
let noise: Float32Array | null = null;

/**
 * A fixed blue-noise rank in [0, 1) for every tile: tiles whose rank falls
 * in any one range are spread evenly over the map with no grid to them.
 * Built once for a classic-size patch by placing tiles one at a time in the
 * biggest gap left (wrapping around the edges), and tiled over bigger maps.
 *
 * @returns One rank per tile of a classic-size patch, row-major.
 */
export function blueNoise(): Float32Array {
  if (noise) {
    return noise;
  }
  const n = MAP_WIDTH * MAP_HEIGHT;
  const energy = new Float64Array(n);
  const placed = new Uint8Array(n);
  let h = 0x9e3779b9;
  for (let i = 0; i < n; i++) {
    h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d) ^ i;
    energy[i] = ((h >>> 0) / 2 ** 32) * 1e-6;
  }
  const R = 4;
  const SIGMA2 = 2 * 1.6 * 1.6;
  noise = new Float32Array(n);
  for (let k = 0; k < n; k++) {
    let best = -1;
    for (let i = 0; i < n; i++) {
      if (!placed[i] && (best < 0 || energy[i] < energy[best])) {
        best = i;
      }
    }
    placed[best] = 1;
    noise[best] = k / n;
    const bx = best % MAP_WIDTH;
    const by = Math.floor(best / MAP_WIDTH);
    for (let dy = -R; dy <= R; dy++) {
      for (let dx = -R; dx <= R; dx++) {
        const x = (bx + dx + MAP_WIDTH) % MAP_WIDTH;
        const y = (by + dy + MAP_HEIGHT) % MAP_HEIGHT;
        energy[y * MAP_WIDTH + x] += Math.exp(-(dx * dx + dy * dy) / SIGMA2);
      }
    }
  }
  return noise;
}
