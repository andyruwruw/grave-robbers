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

// Local Imports
import { SPOTIFY_SESSION_PATH } from '../../config/paths';
import {
  AUTHORIZE_URL,
  CLIENT_ID,
  CLIENT_SECRET,
  ENV_REFRESH_TOKEN,
  REDIRECT_URI,
  REFRESH_MARGIN_MS,
  SCOPES,
  TOKEN_URL,
} from './config/spotify';
import { safeReturn, withParam } from './helpers/redirects';

// Types
import type { SpotifyStatus } from '@halloween/shared/audio/spotify';
import type { SpotifySession, TokenResponse } from './types/spotify';

/**
 * The server's linked Spotify account: the session (from
 * SPOTIFY_REFRESH_TOKEN, or a login saved from the TV), the logins in
 * flight, and fresh access tokens. Made once, by `mountSpotify`.
 */
export class SpotifyAccount {
  /**
   * The linked account: from SPOTIFY_REFRESH_TOKEN if set, else the login
   * saved at SPOTIFY_SESSION_PATH, else none.
   */
  private _session: SpotifySession | null = ENV_REFRESH_TOKEN
    ? { refreshToken: ENV_REFRESH_TOKEN, accessToken: '', expiresAt: 0 }
    : existsSync(SPOTIFY_SESSION_PATH) ? JSON.parse(readFileSync(SPOTIFY_SESSION_PATH, 'utf8')) as SpotifySession : null;

  /**
   * Login attempts in flight: state value to the page to return to.
   */
  private readonly _pending = new Map<string, string>();

  /**
   * Whether Spotify is configured and linked.
   * @returns The status the TV shows.
   */
  status(): SpotifyStatus {
    return { configured: Boolean(CLIENT_ID && CLIENT_SECRET), linked: this._session !== null };
  }

  /**
   * Starts a login that comes back to a page afterwards.
   * @param returnTo The page asked for (only an http(s) URL is honored).
   * @returns Spotify's login URL to send the browser to.
   */
  beginLogin(returnTo: unknown): string {
    const state = randomBytes(12).toString('base64url');
    this._pending.set(state, safeReturn(returnTo));
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: CLIENT_ID,
      scope: SCOPES.join(' '),
      redirect_uri: REDIRECT_URI,
      state,
    });
    return `${AUTHORIZE_URL}?${params}`;
  }

  /**
   * Finishes a login from Spotify's redirect: trades the code for tokens
   * and links the account.
   * @param state The login's state value.
   * @param code The code Spotify sent, if any.
   * @returns The page to send the browser back to, marked linked or error.
   */
  async finishLogin(state: string, code: unknown): Promise<string> {
    const back = this._pending.get(state);
    this._pending.delete(state);
    if (!back || typeof code !== 'string') {
      return withParam(back ?? '/tv', 'spotify', 'error');
    }
    try {
      const token = await this.requestToken({ grant_type: 'authorization_code', code, redirect_uri: REDIRECT_URI });
      this.save({
        refreshToken: token.refresh_token ?? '',
        accessToken: token.access_token,
        expiresAt: Date.now() + token.expires_in * 1000,
      });
      return withParam(back, 'spotify', 'linked');
    } catch (err) {
      console.error('[spotify]', (err as Error).message);
      return withParam(back, 'spotify', 'error');
    }
  }

  /**
   * A usable access token for the linked account, refreshed if it's about
   * to expire.
   * @returns The token, or null when nothing is linked.
   */
  async accessToken(): Promise<string | null> {
    if (!this._session) {
      return null;
    }
    if (Date.now() < this._session.expiresAt - REFRESH_MARGIN_MS) {
      return this._session.accessToken;
    }
    const token = await this.requestToken({ grant_type: 'refresh_token', refresh_token: this._session.refreshToken });
    this.save({
      refreshToken: token.refresh_token ?? this._session.refreshToken,
      accessToken: token.access_token,
      expiresAt: Date.now() + token.expires_in * 1000,
    });
    return token.access_token;
  }

  /**
   * Forgets the linked account.
   */
  logout(): void {
    this.save(null);
  }

  /**
   * Keeps the session in memory, and on disk unless it came from
   * SPOTIFY_REFRESH_TOKEN (the env file already holds that one).
   * @param next The new session, or null to unlink.
   */
  private save(next: SpotifySession | null): void {
    this._session = next;
    if (next && next.refreshToken === ENV_REFRESH_TOKEN) {
      return;
    }
    if (next) {
      mkdirSync(dirname(SPOTIFY_SESSION_PATH), { recursive: true });
      writeFileSync(SPOTIFY_SESSION_PATH, JSON.stringify(next));
    } else {
      rmSync(SPOTIFY_SESSION_PATH, { force: true });
    }
  }

  /**
   * Asks Spotify's token endpoint for tokens.
   * @param params The grant to trade.
   * @returns Spotify's reply.
   */
  private async requestToken(params: Record<string, string>): Promise<TokenResponse> {
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
}
