/**
 * The Spotify app's client id.
 */
export const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID ?? '';

/**
 * The Spotify app's client secret.
 */
export const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET ?? '';

/**
 * A refresh token for the account to play from. When set, the server is
 * linked from the start (no login needed) and this account wins over a
 * login saved from the TV.
 */
export const ENV_REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN ?? '';

/**
 * Must match a redirect URI registered on the Spotify app. Spotify only
 * accepts loopback addresses (127.0.0.1), not "localhost", for plain http.
 */
export const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI ?? 'http://127.0.0.1:3021/auth/spotify/callback';

/**
 * Scopes the Web Playback SDK needs, plus reading playlists for the picker
 * and the account's queue.
 */
export const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-read-currently-playing',
  'user-modify-playback-state',
  'playlist-read-private',
  'playlist-read-collaborative',
];

/**
 * Spotify's login page.
 */
export const AUTHORIZE_URL = 'https://accounts.spotify.com/authorize';

/**
 * Spotify's token endpoint.
 */
export const TOKEN_URL = 'https://accounts.spotify.com/api/token';

/**
 * Spotify's Web API.
 */
export const API_URL = 'https://api.spotify.com/v1';

/**
 * Refresh the access token when it has less than this long left, in ms.
 */
export const REFRESH_MARGIN_MS = 60_000;
