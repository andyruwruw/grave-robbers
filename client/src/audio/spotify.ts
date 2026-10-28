// Types
import type { SpotifyPlaylist, SpotifyStatus } from '@halloween/shared/audio';

const SDK_URL = 'https://sdk.scdn.co/spotify-player.js';
const API_URL = 'https://api.spotify.com/v1';

/**
 * The parts of the Web Playback SDK's player state we use.
 */
export interface SpotifyPlaybackState {
  paused: boolean;

  /**
   * Milliseconds into the track, and its length.
   */
  position: number;
  duration: number;
  track_window: {
    current_track: {
      uri: string;
      name: string;
      artists: { name: string }[];
      album: { images: { url: string; width?: number | null }[] };
    } | null;
  };
}

/**
 * The parts of the Web Playback SDK's Player we use.
 */
export interface SpotifyPlayer {
  connect(): Promise<boolean>;
  disconnect(): void;
  addListener(event: 'ready' | 'not_ready', cb: (e: { device_id: string }) => void): void;
  addListener(event: 'player_state_changed', cb: (state: SpotifyPlaybackState | null) => void): void;
  addListener(event: 'initialization_error' | 'authentication_error' | 'account_error' | 'playback_error', cb: (e: { message: string }) => void): void;
  togglePlay(): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  nextTrack(): Promise<void>;
  setVolume(volume: number): Promise<void>;
  activateElement(): Promise<void>;
}

interface SpotifyPlayerOptions {
  name: string;
  getOAuthToken: (cb: (token: string) => void) => void;
  volume: number;
}

declare global {
  interface Window {
    Spotify?: { Player: new (options: SpotifyPlayerOptions) => SpotifyPlayer };
    onSpotifyWebPlaybackSDKReady?: () => void;
  }
}

let sdk: Promise<NonNullable<Window['Spotify']>> | null = null;

/**
 * Loads the Web Playback SDK script once.
 */
export function loadSpotifySdk(): Promise<NonNullable<Window['Spotify']>> {
  sdk ??= new Promise((resolve, reject): void => {
    window.onSpotifyWebPlaybackSDKReady = (): void => resolve(window.Spotify!);
    const script = document.createElement('script');
    script.src = SDK_URL;
    script.onerror = (): void => reject(new Error('Could not load the Spotify player.'));
    document.head.appendChild(script);
  });
  return sdk;
}

export async function spotifyStatus(): Promise<SpotifyStatus> {
  const res = await fetch('/api/spotify/status');
  return res.ok ? await res.json() as SpotifyStatus : { configured: false, linked: false };
}

/**
 * A short-lived access token from the server, or null if nothing is linked.
 */
export async function spotifyToken(): Promise<string | null> {
  const res = await fetch('/api/spotify/token');
  return res.ok ? (await res.json() as { accessToken: string }).accessToken : null;
}

export async function spotifyPlaylists(): Promise<SpotifyPlaylist[]> {
  const res = await fetch('/api/spotify/playlists');
  return res.ok ? await res.json() as SpotifyPlaylist[] : [];
}

export async function spotifyLogout(): Promise<void> {
  await fetch('/api/spotify/logout', { method: 'POST' });
}

/**
 * One Spotify track as the music player queues it: a big cover for the
 * now-playing screen and a small one for lists.
 */
export interface SpotifyTrack {
  uri: string;
  title: string;
  artist: string;
  art: string | null;
  thumb: string | null;
}

type ApiImage = { url: string; width?: number | null };
type ApiTrack = { uri: string; name: string; type?: string; is_local?: boolean; artists?: { name: string }[]; album?: { images?: ApiImage[] } };

/**
 * A track from the Web API or the SDK, with its biggest and smallest
 * covers.
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
 */
async function api(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await spotifyToken();
  if (!token) {
    throw new Error('Spotify is not linked.');
  }
  return fetch(`${API_URL}${path}`, { ...init, headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', ...init.headers } });
}

/**
 * Plays one track on the given SDK device.
 */
export async function playTrack(deviceId: string, uri: string): Promise<void> {
  const res = await api(`/me/player/play?device_id=${deviceId}`, { method: 'PUT', body: JSON.stringify({ uris: [uri] }) });
  if (!res.ok) {
    throw new Error(`Spotify wouldn't play the song (${res.status}).`);
  }
}

/**
 * Moves the account's playback to the given SDK device without starting it.
 */
export async function transferPlayback(deviceId: string): Promise<void> {
  await api('/me/player', { method: 'PUT', body: JSON.stringify({ device_ids: [deviceId], play: false }) });
}

/**
 * Skips the given device to the next song in the account's queue.
 */
export async function skipToQueued(deviceId: string): Promise<void> {
  const res = await api(`/me/player/next?device_id=${deviceId}`, { method: 'POST' });
  if (!res.ok) {
    throw new Error(`Spotify wouldn't skip (${res.status}).`);
  }
}

/**
 * What's queued on the account (from a phone or a Jam), in order.
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
 * Every playable track in a playlist (up to `limit`).
 */
export async function playlistTracks(uri: string, limit = 500): Promise<SpotifyTrack[]> {
  const id = uri.split(':').pop();
  const tracks: SpotifyTrack[] = [];
  let path: string | null = `/playlists/${id}/tracks?limit=100&fields=next,items(track(uri,name,type,is_local,artists(name),album(images)))`;
  while (path && tracks.length < limit) {
    const res: Response = await api(path);
    if (!res.ok) {
      throw new Error(`Spotify wouldn't list the playlist (${res.status}).`);
    }
    const body = await res.json() as { next: string | null; items: { track: ApiTrack | null }[] };
    for (const { track } of body.items) {
      if (track && !track.is_local && (track.type ?? 'track') === 'track') {
        tracks.push(toTrack(track));
      }
    }
    path = body.next ? body.next.replace(API_URL, '') : null;
  }
  return tracks;
}
