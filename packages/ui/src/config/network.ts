/**
 * How often the controller sends its joystick vector, in ms.
 */
export const INPUT_SEND_INTERVAL = 33;

/**
 * Shortest reconnect backoff, in ms.
 */
export const RECONNECT_MIN_DELAY = 500;

/**
 * Longest reconnect backoff, in ms.
 */
export const RECONNECT_MAX_DELAY = 5000;

/**
 * An open socket that hasn't heard anything in this long (ms) is given up
 * and reopened: the server pings every second, so silence this long means
 * the connection died without closing (Wi-Fi dropped, the laptop slept).
 */
export const SOCKET_STALE_MS = 6000;

/**
 * How long (ms) a page that broke shows its note before reloading
 * (`CrashReload`).
 */
export const CRASH_RELOAD_MS = 3000;
