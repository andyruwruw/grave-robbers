/**
 * Reads a localStorage value, tolerating private mode and blocked storage.
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
