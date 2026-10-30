// Local Imports
import { API_URL } from './config/spotify';

// Types
import type { SpotifyPlaylist } from '@halloween/shared/audio/spotify';
import type { PlaylistItem } from './types/spotify';

/**
 * The linked account's playlists, each with its smallest cover image.
 * @param token A valid access token.
 * @returns Up to 50 playlists.
 */
export async function fetchPlaylists(token: string): Promise<SpotifyPlaylist[]> {
  const reply = await fetch(`${API_URL}/me/playlists?limit=50`, { headers: { Authorization: `Bearer ${token}` } });
  const body = await reply.json() as { items?: (PlaylistItem | null)[] };
  return (body.items ?? [])
    .filter((p): p is PlaylistItem => p !== null)
    .map(({ name, uri, images }): SpotifyPlaylist => ({
      name,
      uri,
      image: (images ?? []).reduce<{ url: string; width?: number | null } | null>((best, img) => (!best || (img.width ?? 0) < (best.width ?? 0) ? img : best), null)?.url ?? null,
    }));
}
