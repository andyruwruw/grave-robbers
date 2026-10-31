/**
 * How often (ms) every socket is pinged.
 */
export const PING_INTERVAL_MS = 1000;

/**
 * A socket that hasn't answered a ping in this long (ms) is dropped
 * (`PingTracker.pingAll`): a phone that left the Wi-Fi without closing
 * leaves a half-open socket that would otherwise hang on forever.
 */
export const PONG_TIMEOUT_MS = 20_000;

/**
 * How much each new round trip moves the smoothed one.
 */
export const PING_SMOOTHING = 0.3;
