// Types
import type { StatsSnapshot } from '../types/stats';

/**
 * Ping (ms) that shows in red: past this, play starts to feel laggy.
 */
export const PING_WARN_MS = 120;

/**
 * The stats shown before the first snapshot arrives.
 */
export const EMPTY_STATS: StatsSnapshot = { tps: 0, stepMs: 0, worldLevel: 0, levels: {}, fps: 0, displayKBps: 0, ping: null, monsters: 0, items: 0, bloodMoon: false };
