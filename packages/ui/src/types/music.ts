// Types
import type { AudioSettings } from '@halloween/shared/audio/audio-settings';
import type { SpotifyPlaybackState, SpotifyTrack } from './spotify';

/**
 * A song to play: one mp3, or several parts (bass, drums, melody, ...) that
 * play together and can be mixed in and out.
 */
export interface Song {
  /**
   * Its file or folder name in title case, until a tag names it.
   */
  title: string;

  /**
   * Title that wins over the ID3 tag (from `meta.json`).
   */
  fixedTitle: string | null;

  /**
   * Artist that wins over the ID3 tag (from `meta.json`).
   */
  artist: string | null;

  /**
   * Each part's name and mp3.
   */
  parts: { name: string; url: string }[];

  /**
   * Cover art URL, if it has any.
   */
  art: string | null;

  /**
   * The file whose ID3 tag names the song.
   */
  tagUrl: string;
}

/**
 * What's going on in the game, which decides how much of each part plays.
 */
export interface MusicMood {
  /**
   * Someone's phone is connected.
   */
  players: boolean;

  /**
   * A fight is on.
   */
  fight: boolean;

  /**
   * The blood moon is up.
   */
  bloodMoon: boolean;
}

/**
 * One song in the player's own queue: a Spotify track (queued on the
 * account, or from the playlist) or a custom song.
 */
export type QueueItem =
  /**
   * A Spotify track, from the account's queue or the playlist.
   */
  | { kind: 'spotify'; track: SpotifyTrack; source: 'queue' | 'playlist' }
  /**
   * A custom song from the media folder.
   */
  | { kind: 'custom'; song: Song };

/**
 * The Music tab's choices the player acts on.
 */
export type MusicOptions = Pick<AudioSettings, 'live' | 'spotify' | 'custom' | 'playlist' | 'spotifyWeight' | 'customWeight'>;

/**
 * An mp3's ID3 title, artist, and album art (as an object URL).
 */
export interface SongTags {
  /**
   * The tag's title.
   */
  title: string | null;

  /**
   * The tag's artist.
   */
  artist: string | null;

  /**
   * An object URL for the tag's cover picture.
   */
  art: string | null;
}

/**
 * What the Spotify source asks of the music player that owns it.
 */
export interface SpotifySourceHooks {
  /**
   * Whether this TV page plays the music.
   *
   * @returns True while it does.
   */
  isEnabled(): boolean;

  /**
   * Whether the player has stopped for good.
   *
   * @returns True once disposed.
   */
  isDisposed(): boolean;

  /**
   * The volume a new SDK player starts at.
   *
   * @returns 0..1.
   */
  volume(): number;

  /**
   * Handles a playback state change from the SDK.
   *
   * @param state - The new state, or null once the device isn't playing.
   */
  onState(state: SpotifyPlaybackState | null): void;

  /**
   * Shows an error under the music.
   *
   * @param message - What went wrong.
   */
  fail(message: string): void;

  /**
   * Sends the music status out.
   */
  publish(): void;

  /**
   * Applies the volume to whatever plays.
   */
  applyVolume(): void;

  /**
   * Clears the error, once a track was asked for successfully.
   */
  clearError(): void;
}
