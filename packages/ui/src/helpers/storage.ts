/**
 * Reads a localStorage value, tolerating private mode and blocked storage.
 *
 * @param key - The storage key.
 * @returns The stored value, or null when missing or unreadable.
 */
export function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Writes (or with `null`, removes) a localStorage value, ignoring failures.
 *
 * @param key - The storage key.
 * @param value - The value to store, or null to remove it.
 */
export function writeStorage(key: string, value: string | null): void {
  try {
    if (value === null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  } catch {
    // Storage unavailable: the phone just won't remember its player.
  }
}
