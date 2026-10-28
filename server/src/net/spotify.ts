// Packages
import { randomBytes } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Types
import type {
  Express,
  Request,
  Response,
} from 'express';
import type { SpotifyPlaylist, SpotifyStatus } from '@halloween/shared/audio';

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID ?? '';
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET ?? '';

/**
 * A refresh token for the account to play from. When set, the server is
 * linked from the start (no login needed) and this account wins over a
 * login saved from the TV.
 */
const ENV_REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN ?? '';

/**
 * Must match a redirect URI registered on the Spotify app. Spotify only
 * accepts loopback addresses (127.0.0.1), not "localhost", for plain http.
 */
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI ?? 'http://127.0.0.1:3021/auth/spotify/callback';

/**
 * Scopes the Web Playback SDK needs, plus reading playlists for the picker
 * and the account's queue.
 */
const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-read-currently-playing',
  'user-modify-playback-state',
  'playlist-read-private',
  'playlist-read-collaborative',
];

const AUTHORIZE_URL = 'https://accounts.spotify.com/authorize';
const TOKEN_URL = 'https://accounts.spotify.com/api/token';
const API_URL = 'https://api.spotify.com/v1';

/**
 * Where the linked account's refresh token is kept (gitignored, next to the
 * world save).
 */
const SESSION_PATH = process.env.SPOTIFY_SAVE ?? fileURLToPath(new URL('../../data/spotify.json', import.meta.url));

/**
 * Refresh the access token when it has less than this long left, in ms.
 */
const REFRESH_MARGIN_MS = 60_000;

/**
 * A linked Spotify account.
 */
interface Session {
  refreshToken: string;
  accessToken: string;
  expiresAt: number;
}

/**
 * Spotify's token endpoint response.
 */
interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
}

let session: Session | null = ENV_REFRESH_TOKEN
  ? { refreshToken: ENV_REFRESH_TOKEN, accessToken: '', expiresAt: 0 }
  : existsSync(SESSION_PATH) ? JSON.parse(readFileSync(SESSION_PATH, 'utf8')) as Session : null;

/**
 * Login attempts in flight: state value to the page to return to.
 */
const pending = new Map<string, string>();

/**
 * Keeps the session in memory, and on disk unless it came from
 * SPOTIFY_REFRESH_TOKEN (the env file already holds that one).
 */
function saveSession(next: Session | null): void {
  session = next;
  if (next && next.refreshToken === ENV_REFRESH_TOKEN) {
    return;
  }
  if (next) {
    mkdirSync(dirname(SESSION_PATH), { recursive: true });
    writeFileSync(SESSION_PATH, JSON.stringify(next));
  } else {
    rmSync(SESSION_PATH, { force: true });
  }
}

async function requestToken(params: Record<string, string>): Promise<TokenResponse> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
    },
    body: new URLSearchParams(params),
  });
  if (!res.ok) {
    throw new Error(`Spotify token request failed: ${res.status} ${await res.text()}`);
  }
  return await res.json() as TokenResponse;
}

/**
 * A usable access token for the linked account, refreshed if it's about
 * to expire. Null when nothing is linked.
 */
async function accessToken(): Promise<string | null> {
  if (!session) {
    return null;
  }
  if (Date.now() < session.expiresAt - REFRESH_MARGIN_MS) {
    return session.accessToken;
  }
  const token = await requestToken({ grant_type: 'refresh_token', refresh_token: session.refreshToken });
  saveSession({
    refreshToken: token.refresh_token ?? session.refreshToken,
    accessToken: token.access_token,
    expiresAt: Date.now() + token.expires_in * 1000,
  });
  return token.access_token;
}

/**
 * Only send people back to an http(s) page.
 */
function safeReturn(value: unknown): string {
  return typeof value === 'string' && /^https?:\/\//.test(value) ? value : '/tv';
}

function withParam(url: string, key: string, value: string): string {
  return `${url}${url.includes('?') ? '&' : '?'}${key}=${value}`;
}

/**
 * Spotify account linking for the TV's music player. The server holds the
 * client secret and refresh token (from SPOTIFY_REFRESH_TOKEN, or a login
 * started on the TV); the TV only ever gets short-lived access tokens for
 * the Web Playback SDK.
 *
 * - `GET /api/spotify/status`: whether Spotify is configured and linked.
 * - `GET /auth/spotify/login?return=<url>`: starts the login, then comes back to `return`.
 * - `GET /auth/spotify/callback`: Spotify's redirect target.
 * - `GET /api/spotify/token`: a fresh access token.
 * - `GET /api/spotify/playlists`: the linked account's playlists.
 * - `POST /api/spotify/logout`: forgets the account.
 */
export function mountSpotify(app: Express): void {
  app.get('/api/spotify/status', (_req: Request, res: Response): void => {
    const status: SpotifyStatus = { configured: Boolean(CLIENT_ID && CLIENT_SECRET), linked: session !== null };
    res.json(status);
  });

  app.get('/auth/spotify/login', (req: Request, res: Response): void => {
    if (!CLIENT_ID || !CLIENT_SECRET) {
      res.status(500).send('Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET for the server first.');
      return;
    }
    const state = randomBytes(12).toString('base64url');
    pending.set(state, safeReturn(req.query.return));
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: CLIENT_ID,
      scope: SCOPES.join(' '),
      redirect_uri: REDIRECT_URI,
      state,
    });
    res.redirect(`${AUTHORIZE_URL}?${params}`);
  });

  app.get('/auth/spotify/callback', async (req: Request, res: Response): Promise<void> => {
    const state = String(req.query.state ?? '');
    const back = pending.get(state);
    pending.delete(state);
    if (!back || typeof req.query.code !== 'string') {
      res.redirect(withParam(back ?? '/tv', 'spotify', 'error'));
      return;
    }
    try {
      const token = await requestToken({ grant_type: 'authorization_code', code: req.query.code, redirect_uri: REDIRECT_URI });
      saveSession({
        refreshToken: token.refresh_token ?? '',
        accessToken: token.access_token,
        expiresAt: Date.now() + token.expires_in * 1000,
      });
      res.redirect(withParam(back, 'spotify', 'linked'));
    } catch (err) {
      console.error('[spotify]', (err as Error).message);
      res.redirect(withParam(back, 'spotify', 'error'));
    }
  });

  app.get('/api/spotify/token', async (_req: Request, res: Response): Promise<void> => {
    try {
      const token = await accessToken();
      if (token) {
        res.json({ accessToken: token });
      } else {
        res.status(404).json({ error: 'Spotify is not linked.' });
      }
    } catch (err) {
      console.error('[spotify]', (err as Error).message);
      res.status(502).json({ error: 'Could not refresh the Spotify token.' });
    }
  });

  app.get('/api/spotify/playlists', async (_req: Request, res: Response): Promise<void> => {
    try {
      const token = await accessToken();
      if (!token) {
        res.status(404).json({ error: 'Spotify is not linked.' });
        return;
      }
      const reply = await fetch(`${API_URL}/me/playlists?limit=50`, { headers: { Authorization: `Bearer ${token}` } });
      type Item = { name: string; uri: string; images?: { url: string; width?: number | null }[] | null };
      const body = await reply.json() as { items?: (Item | null)[] };
      const playlists: SpotifyPlaylist[] = (body.items ?? [])
        .filter((p): p is Item => p !== null)
        .map(({ name, uri, images }): SpotifyPlaylist => ({
          name,
          uri,
          image: (images ?? []).reduce<{ url: string; width?: number | null } | null>((best, img) => (!best || (img.width ?? 0) < (best.width ?? 0) ? img : best), null)?.url ?? null,
        }));
      res.json(playlists);
    } catch (err) {
      console.error('[spotify]', (err as Error).message);
      res.status(502).json({ error: 'Could not load playlists.' });
    }
  });

  app.post('/api/spotify/logout', (_req: Request, res: Response): void => {
    saveSession(null);
    res.status(204).end();
  });
}
