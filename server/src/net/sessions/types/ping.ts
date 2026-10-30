/**
 * One socket's ping state.
 */
export interface Ping {
  /**
   * When the ping in flight was sent, or null when none is.
   */
  sentAt: number | null;

  /**
   * The smoothed round trip (ms), or null before the first pong.
   */
  rtt: number | null;
}
