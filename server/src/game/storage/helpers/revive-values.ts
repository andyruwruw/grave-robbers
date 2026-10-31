// Types
import type { RepairLog } from '../repair-log';

/**
 * Parsed JSON whose shape isn't known yet.
 */
export type Raw = Record<string, unknown>;

/**
 * Whether a value is a plain object.
 * @param v The value.
 * @returns True for an object that isn't an array or null.
 */
export function isRaw(v: unknown): v is Raw {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/**
 * Notes a value that had to be replaced: missing (a field added since the
 * save was written) or bad (wrong type or out of range).
 * @param log Where fixes are noted.
 * @param what The field.
 * @param v The value found.
 */
function replaced(log: RepairLog, what: string, v: unknown): void {
  log.note(v === undefined ? `filled in missing ${what}` : `replaced bad ${what}`);
}

/**
 * A finite number kept in range, or the fallback.
 * @param v The value.
 * @param fallback Used when it's missing or not a finite number.
 * @param log Where fixes are noted.
 * @param what The field.
 * @param min The least it may be.
 * @param max The most it may be.
 * @returns The number.
 */
export function num(v: unknown, fallback: number, log: RepairLog, what: string, min = -Infinity, max = Infinity): number {
  if (typeof v !== 'number' || !Number.isFinite(v)) {
    replaced(log, what, v);
    return fallback;
  }
  if (v < min || v > max) {
    log.note(`clamped ${what}`);
    return Math.min(max, Math.max(min, v));
  }
  return v;
}

/**
 * A whole number kept in range, or the fallback.
 * @param v The value.
 * @param fallback Used when it's missing or not a finite number.
 * @param log Where fixes are noted.
 * @param what The field.
 * @param min The least it may be.
 * @param max The most it may be.
 * @returns The whole number.
 */
export function int(v: unknown, fallback: number, log: RepairLog, what: string, min = -Infinity, max = Infinity): number {
  return Math.round(num(v, fallback, log, what, min, max));
}

/**
 * A string, or the fallback.
 * @param v The value.
 * @param fallback Used when it isn't a string.
 * @param log Where fixes are noted.
 * @param what The field.
 * @returns The string.
 */
export function str(v: unknown, fallback: string, log: RepairLog, what: string): string {
  if (typeof v !== 'string') {
    replaced(log, what, v);
    return fallback;
  }
  return v;
}

/**
 * A boolean, or the fallback.
 * @param v The value.
 * @param fallback Used when it isn't a boolean.
 * @param log Where fixes are noted.
 * @param what The field.
 * @returns The boolean.
 */
export function bool(v: unknown, fallback: boolean, log: RepairLog, what: string): boolean {
  if (typeof v !== 'boolean') {
    replaced(log, what, v);
    return fallback;
  }
  return v;
}

/**
 * An optional number: kept if it's a finite number (clamped), dropped
 * (undefined) if it's missing or bad.
 * @param v The value.
 * @param log Where fixes are noted.
 * @param what The field.
 * @param min The least it may be.
 * @param max The most it may be.
 * @returns The number, or undefined.
 */
export function optNum(v: unknown, log: RepairLog, what: string, min = -Infinity, max = Infinity): number | undefined {
  return v === undefined ? undefined : num(v, min > -Infinity ? min : 0, log, what, min, max);
}

/**
 * The items of a list that revive, dropping (and noting) the rest.
 * @param v The value (a list, or anything else: an empty list).
 * @param revive Turns one item into its kept form, or null to drop it.
 * @param log Where fixes are noted.
 * @param what What one item is.
 * @returns The kept items.
 */
export function list<T>(v: unknown, revive: (item: unknown) => T | null, log: RepairLog, what: string): T[] {
  if (!Array.isArray(v)) {
    if (v !== undefined) {
      log.note(`replaced bad list of ${what}`);
    }
    return [];
  }
  const out: T[] = [];
  for (const item of v) {
    const kept = revive(item);
    if (kept === null) {
      log.note(`dropped a bad ${what}`);
    } else {
      out.push(kept);
    }
  }
  return out;
}
