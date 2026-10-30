// Types
import type { SpotifyPlaylist, SpotifyStatus } from '@halloween/shared/audio/spotify';

/**
 * Whether the server has Spotify set up and an account linked.
 *
 * @returns The server's answer, or not configured if it can't be reached.
 */
export async function spotifyStatus(): Promise<SpotifyStatus> {
  const res = await fetch('/api/spotify/status');
  return res.ok ? await res.json() as SpotifyStatus : { configured: false, linked: false };
}

/**
 * A short-lived access token from the server, or null if nothing is linked.
 *
 * @returns The token, or null.
 */
export async function spotifyToken(): Promise<string | null> {
  const res = await fetch('/api/spotify/token');
  return res.ok ? (await res.json() as { accessToken: string }).accessToken : null;
}

/**
 * The linked account's playlists.
 *
 * @returns The playlists, or none if the server can't list them.
 */
export async function spotifyPlaylists(): Promise<SpotifyPlaylist[]> {
  const res = await fetch('/api/spotify/playlists');
  return res.ok ? await res.json() as SpotifyPlaylist[] : [];
}

/**
 * Unlinks the Spotify account on the server.
 */
export async function spotifyLogout(): Promise<void> {
  await fetch('/api/spotify/logout', { method: 'POST' });
}
