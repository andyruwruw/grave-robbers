/**
 * A linked Spotify account.
 */
export interface SpotifySession {
  /**
   * Gets new access tokens; kept until the account is unlinked.
   */
  refreshToken: string;

  /**
   * The current access token ('' until the first refresh).
   */
  accessToken: string;

  /**
   * When the access token expires (ms since the epoch).
   */
  expiresAt: number;
}

/**
 * Spotify's token endpoint response.
 */
export interface TokenResponse {
  /**
   * A new access token.
   */
  access_token: string;

  /**
   * Seconds until it expires.
   */
  expires_in: number;

  /**
   * A new refresh token, when Spotify rotates it.
   */
  refresh_token?: string;
}

/**
 * One playlist as Spotify's `/me/playlists` lists it (only what's used).
 */
export interface PlaylistItem {
  /**
   * Its name.
   */
  name: string;

  /**
   * Its Spotify URI.
   */
  uri: string;

  /**
   * Its cover art in a few sizes.
   */
  images?: { url: string; width?: number | null }[] | null;
}
