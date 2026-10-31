// Local Imports
import { GUARD_LOG_EVERY_MS } from '../../config/server';

/**
 * When each label last logged, and how many errors it swallowed since.
 */
const logged = new Map<string, { at: number; quiet: number }>();

/**
 * Logs an error caught under `label`, at most once every
 * GUARD_LOG_EVERY_MS per label (counting the ones it skipped), so a bug
 * that throws every tick doesn't flood the log.
 *
 * @param label Where it happened.
 * @param err What was thrown.
 */
export function logCaught(label: string, err: unknown): void {
  const now = Date.now();
  const entry = logged.get(label);
  if (entry && now - entry.at < GUARD_LOG_EVERY_MS) {
    entry.quiet++;
    return;
  }
  const quiet = entry?.quiet ?? 0;
  logged.set(label, { at: now, quiet: 0 });
  console.error(`[guard] ${label} threw${quiet > 0 ? ` (${quiet} more since last report)` : ''}:`, err);
}

/**
 * Runs `fn`, and if it throws, logs it (`logCaught`) and carries on, so
 * one broken part of a tick can't stop the rest of it, or the next one.
 *
 * @param label Where it runs, for the log.
 * @param fn What to run.
 * @returns Whether it ran without throwing.
 */
export function guard(label: string, fn: () => void): boolean {
  try {
    fn();
    return true;
  } catch (err) {
    logCaught(label, err);
    return false;
  }
}
