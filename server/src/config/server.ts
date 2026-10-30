/**
 * The port the HTTP and WebSocket server listens on (`PORT` overrides it).
 */
export const PORT = Number(process.env.PORT ?? 3021);

/**
 * How often (ms) the world is saved to disk.
 */
export const SAVE_INTERVAL_MS = 30_000;

/**
 * Each built app and the route it's served at; the phone app takes
 * everything else.
 */
export const APPS: [string, string][] = [['/tv', 'tv'], ['/play', 'play'], ['/admin', 'admin'], ['/', 'mobile']];

/**
 * The most fixed steps the loop runs to catch up after a stall.
 */
export const MAX_CATCH_UP = 4;
