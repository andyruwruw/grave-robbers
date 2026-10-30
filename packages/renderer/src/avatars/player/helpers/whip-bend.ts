// Local Imports
import { easeOut } from '../../../helpers/easing';
import { HANG_END, IMPACT_END, STRIKE_END } from '../config/player-timing';

/**
 * How far one whip joint bends at a point in the swing: trailing behind on
 * the windup, a wave rolling down it as it comes forward, snapping straight
 * at the crack, then hanging loose and swaying (phase 1 and after).
 * @param phase How far through the swing, 0 to 1.
 * @param time Seconds since the renderer started.
 * @param i The joint's index from the handle.
 * @param k How far down the whip the joint is, 0 to 1.
 * @returns The joint's bend around z.
 */
export const whipBend = (phase: number, time: number, i: number, k: number): number => {
  let bend: number;
  if (phase < HANG_END) {
    bend = 0.32 * easeOut(phase / HANG_END) + 0.1;
  } else if (phase < STRIKE_END) {
    const t = (phase - HANG_END) / (STRIKE_END - HANG_END);
    bend = Math.sin((t * 2 - k) * Math.PI) * 0.35 * (1 - t);
  } else if (phase < IMPACT_END) {
    bend = 0;
  } else {
    const loose = phase < 1 ? (phase - IMPACT_END) / (1 - IMPACT_END) : 1;
    bend = (0.12 + Math.sin(time * 2.5 + i * 0.8) * 0.06) * loose;
  }
  return bend;
};
