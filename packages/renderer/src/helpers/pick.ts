/**
 * Picks one entry from a palette.
 * @param rand The seeded PRNG to roll with (called once).
 * @param list The entries to pick from.
 * @returns The picked entry.
 */
export function pick<T>(rand: () => number, list: T[]): T {
  return list[Math.floor(rand() * list.length)];
}
