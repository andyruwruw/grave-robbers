// Local Imports
import { WHIP_COIL_END, WHIP_COIL_START } from '../config/whip';

/**
 * How far one whip joint bends to coil the whip up: a little more each
 * joint down the lash, so it winds into a tightening spiral by the hand.
 * @param k How far down the whip the joint is, 0 to 1.
 * @returns The joint's bend around z.
 */
export const coilBend = (k: number): number => WHIP_COIL_START + (WHIP_COIL_END - WHIP_COIL_START) * k;
