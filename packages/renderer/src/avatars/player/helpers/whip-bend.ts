// Local Imports
import { easeOut } from '../../../helpers/easing';
import { coilBend } from '../../../models/gear/helpers/whip-coil';
import { COIL_IN, HANG_END, IMPACT_END, STRIKE_END } from '../config/player-timing';

/**
 * How far one whip joint bends at a point in the swing: unwinding from its
 * coil as it trails behind on the windup, a wave rolling down it as it comes forward, snapping straight
 * at the crack, hanging loose and swaying after it, then winding back up
 * into a coil by the hand (over COIL_IN past phase 1), which is how it
 * rests when not in use.
 * @param phase How far through the swing, 0 to 1.
 * @param time Seconds since the renderer started.
 * @param i The joint's index from the handle.
 * @param k How far down the whip the joint is, 0 to 1.
 * @param from How coiled the whip was when the swing started, 0 to 1.
 * @returns The joint's bend around z.
 */
export const whipBend = (phase: number, time: number, i: number, k: number, from: number): number => {
  let bend: number;
  if (phase < HANG_END) {
    const t = easeOut(phase / HANG_END);
    const trail = 0.32 * t + 0.1;
    bend = trail + (coilBend(k) * from - trail) * (1 - t);
  } else if (phase < STRIKE_END) {
    const t = (phase - HANG_END) / (STRIKE_END - HANG_END);
    bend = Math.sin((t * 2 - k) * Math.PI) * 0.35 * (1 - t);
  } else if (phase < IMPACT_END) {
    bend = 0;
  } else {
    const loose = phase < 1 ? (phase - IMPACT_END) / (1 - IMPACT_END) : 1;
    bend = (0.12 + Math.sin(time * 2.5 + i * 0.8) * 0.06) * loose;
    if (phase > 1) {
      const c = Math.min(1, (phase - 1) / COIL_IN);
      const eased = c * c * (3 - 2 * c);
      bend += (coilBend(k) - bend) * eased;
    }
  }
  return bend;
};
