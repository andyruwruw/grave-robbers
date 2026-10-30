/**
 * A slow, irregular 0..1 multiplier for one light, from two out-of-step
 * waves so neighbors never pulse together.
 * @param time Clock seconds.
 * @param seed A number unique to the light.
 * @param depth How deep the flicker dips (0..1).
 * @returns The multiplier.
 */
export function flicker(time: number, seed: number, depth: number): number {
  const wave = 0.6 * Math.sin(time * 1.3 + seed * 1.7) + 0.4 * Math.sin(time * 2.9 + seed * 3.1);
  return 1 - depth * (0.5 + 0.5 * wave);
}
