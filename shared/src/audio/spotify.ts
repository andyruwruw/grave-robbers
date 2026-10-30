/**
 * Whether the server has Spotify credentials and a linked account.
 */
export interface SpotifyStatus {
  /**
   * Whether the server has Spotify app credentials.
   */
  configured: boolean;

  /**
   * Whether a Spotify account is linked.
   */
  linked: boolean;
}

/**
 * One of the linked account's playlists, for the TV's picker.
 */
export interface SpotifyPlaylist {
  /**
   * The playlist's name.
   */
  name: string;

  /**
   * The playlist's Spotify URI.
   */
  uri: string;

  /**
   * A small cover image, if it has one.
   */
  image: string | null;
}
