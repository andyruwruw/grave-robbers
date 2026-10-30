/**
 * Formats seconds as m:ss.
 *
 * @param seconds - The time.
 * @returns It as m:ss.
 */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
