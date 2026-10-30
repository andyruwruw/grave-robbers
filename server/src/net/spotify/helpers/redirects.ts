/**
 * Only send people back to an http(s) page.
 * @param value The page asked for.
 * @returns It, or `/tv` if it isn't an http(s) URL.
 */
export function safeReturn(value: unknown): string {
  return typeof value === 'string' && /^https?:\/\//.test(value) ? value : '/tv';
}

/**
 * A URL with one more query parameter.
 * @param url The URL.
 * @param key The parameter's name.
 * @param value Its value (not encoded).
 * @returns The new URL.
 */
export function withParam(url: string, key: string, value: string): string {
  return `${url}${url.includes('?') ? '&' : '?'}${key}=${value}`;
}
