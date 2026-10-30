/**
 * The parts of the Web Playback SDK's player state we use.
 */
export interface SpotifyPlaybackState {
  /**
   * Whether playback is paused.
   */
  paused: boolean;

  /**
   * Milliseconds into the track.
   */
  position: number;

  /**
   * The track's length, in milliseconds.
   */
  duration: number;

  /**
   * The track playing now, if any.
   */
  track_window: {
    /**
     * The current track, or null between tracks.
     */
    current_track: {
      /**
       * The track's Spotify URI.
       */
      uri: string;

      /**
       * The track's title.
       */
      name: string;

      /**
       * The track's artists.
       */
      artists: { name: string }[];

      /**
       * The track's album, for its cover art.
       */
      album: { images: { url: string; width?: number | null }[] };
    } | null;
  };
}

/**
 * The parts of the Web Playback SDK's Player we use.
 */
export interface SpotifyPlayer {
  /**
   * Connects the player to Spotify as a playback device.
   *
   * @returns Whether it connected.
   */
  connect(): Promise<boolean>;

  /**
   * Drops the device.
   */
  disconnect(): void;

  /**
   * Listens for the device going ready or away.
   *
   * @param event - Which change.
   * @param cb - Called with the device id.
   */
  addListener(event: 'ready' | 'not_ready', cb: (e: { device_id: string }) => void): void;

  /**
   * Listens for playback state changes.
   *
   * @param event - The state change event.
   * @param cb - Called with the new state (null once the device isn't playing).
   */
  addListener(event: 'player_state_changed', cb: (state: SpotifyPlaybackState | null) => void): void;

  /**
   * Listens for the player's errors.
   *
   * @param event - Which error.
   * @param cb - Called with its message.
   */
  addListener(event: 'initialization_error' | 'authentication_error' | 'account_error' | 'playback_error', cb: (e: { message: string }) => void): void;

  /**
   * Pauses or resumes.
   */
  togglePlay(): Promise<void>;

  /**
   * Pauses playback.
   */
  pause(): Promise<void>;

  /**
   * Resumes playback.
   */
  resume(): Promise<void>;

  /**
   * Skips to the next track.
   */
  nextTrack(): Promise<void>;

  /**
   * Sets the device volume.
   *
   * @param volume - 0..1.
   */
  setVolume(volume: number): Promise<void>;

  /**
   * Unlocks the player's audio element from a user gesture.
   */
  activateElement(): Promise<void>;
}

/**
 * What the SDK's Player constructor takes.
 */
export interface SpotifyPlayerOptions {
  /**
   * The device name shown in Spotify.
   */
  name: string;

  /**
   * Hands the SDK an access token when it asks.
   */
  getOAuthToken: (cb: (token: string) => void) => void;

  /**
   * Starting volume, 0..1.
   */
  volume: number;
}

declare global {
  interface Window {
    /**
     * The Web Playback SDK, once its script has loaded.
     */
    Spotify?: { Player: new (options: SpotifyPlayerOptions) => SpotifyPlayer };

    /**
     * Called by the SDK script when it's ready.
     */
    onSpotifyWebPlaybackSDKReady?: () => void;
  }
}

/**
 * One Spotify track as the music player queues it: a big cover for the
 * now-playing screen and a small one for lists.
 */
export interface SpotifyTrack {
  /**
   * The track's Spotify URI.
   */
  uri: string;

  /**
   * The track's name.
   */
  title: string;

  /**
   * Its artists, comma separated.
   */
  artist: string;

  /**
   * The biggest cover, for now playing.
   */
  art: string | null;

  /**
   * The smallest cover, for lists.
   */
  thumb: string | null;
}

/**
 * One cover image from the Web API.
 */
export interface ApiImage {
  /**
   * The image's URL.
   */
  url: string;

  /**
   * Its width in px, when Spotify says.
   */
  width?: number | null;
}

/**
 * One track from the Web API (or the SDK's current track).
 */
export interface ApiTrack {
  /**
   * The track's Spotify URI.
   */
  uri: string;

  /**
   * The track's name.
   */
  name: string;

  /**
   * `track` for songs (episodes have another type).
   */
  type?: string;

  /**
   * Whether it's a local file, which the SDK can't play.
   */
  is_local?: boolean;

  /**
   * Its artists.
   */
  artists?: { name: string }[];

  /**
   * Its album, for the covers.
   */
  album?: { images?: ApiImage[] };
}
