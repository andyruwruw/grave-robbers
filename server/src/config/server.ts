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

/**
 * Least ms between two log lines for errors caught in the same place
 * (`guard`), so a bug that throws every tick doesn't flood the log.
 */
export const GUARD_LOG_EVERY_MS = 10_000;

/**
 * Times a monster's update may throw before it's removed (`Horde.fault`).
 */
export const MONSTER_FAULTS = 3;

/**
 * A tick taking longer than this (ms, smoothed) makes the `LoadGovernor`
 * lower the monster caps: about 60% of the 33ms a tick has at 30 a second.
 */
export const LOAD_HIGH_MS = 20;

/**
 * A tick taking longer than this (ms, smoothed; the whole budget) also
 * sheds monsters, the farthest from players first.
 */
export const LOAD_SEVERE_MS = 33;

/**
 * Below this (ms, smoothed) the caps creep back up.
 */
export const LOAD_LOW_MS = 12;

/**
 * Lowest share of the monster caps the governor goes to.
 */
export const LOAD_MIN_SCALE = 0.35;

/**
 * How much the caps' share drops each second ticks run slow, and rises
 * each second they run fast.
 */
export const LOAD_DROP = 0.1;
export const LOAD_RISE = 0.03;

/**
 * Monsters shed each second while ticks run past their whole budget.
 */
export const LOAD_SHED = 6;
