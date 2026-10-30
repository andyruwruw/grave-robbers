// Packages
import { INTERP_DELAY, INTERP_PING_MS } from '@halloween/shared/protocol/network';

/**
 * How far behind the snapshots a renderer draws: a little, to smooth out a
 * laggy connection, or not at all on a quick one.
 *
 * @param {number | null} ping - This page's ping (ms), or null before it's measured.
 * @returns {number} The interpolation delay for `setInterpolation`.
 */
export function interpDelay(ping: number | null): number {
  return ping !== null && ping > INTERP_PING_MS ? INTERP_DELAY : 0;
}
