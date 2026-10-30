/**
 * Server simulation rate.
 */
export const TICK_RATE = 30;

/**
 * Ping (ms) above which a screen draws other players and monsters
 * INTERP_DELAY seconds in the past, blended between snapshots, instead of
 * chasing the latest one; the server's melee rewind counts that delay in
 * for a controller over it.
 */
export const INTERP_PING_MS = 60;

/**
 * On a huge world, a display watching players (`watch`: /play, or the TV's
 * split screen) is only sent monsters, shots, puddles, ground items, and
 * lights within this many tiles of one of them.
 */
export const INTEREST_RADIUS = 40;

/**
 * Seconds in the past a high-ping screen draws others (see INTERP_PING_MS).
 */
export const INTERP_DELAY = 0.1;

/**
 * Path the WebSocket server listens on.
 */
export const SOCKET_PATH = '/ws';
