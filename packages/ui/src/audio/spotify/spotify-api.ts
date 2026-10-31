// Local Imports
import { SPOTIFY_API_URL } from '../../config/spotify';
import { spotifyToken } from './spotify-account';

// Types
import type {
  ApiImage,
  ApiTrack,
  SpotifyTrack,
} from '../../types/spotify';

/**
 * A track from the Web API or the SDK, with its biggest and smallest
 * covers.
 *
 * @param t - The track as Spotify describes it.
 * @returns The track as the music player queues it.
 */
export function toTrack(t: ApiTrack): SpotifyTrack {
  const images = [...(t.album?.images ?? [])].sort((a: ApiImage, b: ApiImage): number => (b.width ?? 0) - (a.width ?? 0));
  return {
    uri: t.uri,
    title: t.name,
    artist: (t.artists ?? []).map((a: { name: string }): string => a.name).join(', '),
    art: images[0]?.url ?? null,
    thumb: images.at(-1)?.url ?? null,
  };
}

/**
 * Calls the Web API with a fresh token from the server.
 *
 * @param path - The API path, after the base URL.
 * @param init - The request options.
 * @returns The response.
 */
async function api(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await spotifyToken();
  if (!token) {
    throw new Error('Spotify is not linked.');
  }
  return fetch(`${SPOTIFY_API_URL}${path}`, { ...init, headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', ...init.headers } });
}

/**
 * Plays one track on the given SDK device.
 *
 * @param deviceId - The SDK device.
 * @param uri - The track's URI.
 */
export async function playTrack(deviceId: string, uri: string): Promise<void> {
  const res = await api(`/me/player/play?device_id=${deviceId}`, { method: 'PUT', body: JSON.stringify({ uris: [uri] }) });
  if (!res.ok) {
    throw new Error(`Spotify wouldn't play the song (${res.status}).`);
  }
}

/**
 * Moves the account's playback to the given SDK device without starting it.
 *
 * @param deviceId - The SDK device.
 */
export async function transferPlayback(deviceId: string): Promise<void> {
  await api('/me/player', { method: 'PUT', body: JSON.stringify({ device_ids: [deviceId], play: false }) });
}

/**
 * Skips the given device to the next song in the account's queue.
 *
 * @param deviceId - The SDK device.
 */
export async function skipToQueued(deviceId: string): Promise<void> {
  const res = await api(`/me/player/next?device_id=${deviceId}`, { method: 'POST' });
  if (!res.ok) {
    throw new Error(`Spotify wouldn't skip (${res.status}).`);
  }
}

/**
 * What's queued on the account (from a phone or a Jam), in order.
 *
 * @returns The queued tracks, or none if Spotify won't say.
 */
export async function spotifyQueue(): Promise<SpotifyTrack[]> {
  const res = await api('/me/player/queue');
  if (!res.ok) {
    return [];
  }
  const body = await res.json() as { queue?: (ApiTrack | null)[] };
  return (body.queue ?? []).filter((t): t is ApiTrack => !!t && (t.type ?? 'track') === 'track').map(toTrack);
}

/**
 * Every playable track in a playlist (up to `limit`), from
 * `/playlists/{id}/items` (Spotify retired `/tracks` for development-mode
 * apps in March 2026; each entry is now under `item`, with the old `track`
 * still read while Spotify sends both).
 *
 * @param uri - The playlist's URI.
 * @param limit - The most tracks to read.
 * @returns The playlist's tracks, in order.
 */
export async function playlistTracks(uri: string, limit = 500): Promise<SpotifyTrack[]> {
  const id = uri.split(':').pop();
  const tracks: SpotifyTrack[] = [];
  const fields = 'uri,name,type,is_local,artists(name),album(images)';
  let path: string | null = `/playlists/${id}/items?limit=100&fields=next,items(item(${fields}),track(${fields}))`;
  while (path && tracks.length < limit) {
    const res: Response = await api(path);
    if (!res.ok) {
      throw new Error(res.status === 403
        ? `Spotify wouldn't list the playlist (403). Apps in development mode can only read playlists the account owns or collaborates on.`
        : `Spotify wouldn't list the playlist (${res.status}).`);
    }
    const body = await res.json() as { next: string | null; items: { item?: ApiTrack | null; track?: ApiTrack | boolean | null }[] };
    for (const entry of body.items) {
      const track = entry.item ?? (typeof entry.track === 'object' ? entry.track : null);
      if (track && !track.is_local && (track.type ?? 'track') === 'track') {
        tracks.push(toTrack(track));
      }
    }
    path = body.next ? body.next.replace(SPOTIFY_API_URL, '') : null;
  }
  return tracks;
}
