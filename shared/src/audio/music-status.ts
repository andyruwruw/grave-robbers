/**
 * Where a queued song came from: queued on the Spotify account (plays
 * first), the playlist, or the custom songs.
 */
export type QueueSource = 'queue' | 'playlist' | 'custom';

/**
 * One song in the TV's queue, as the panels show it.
 */
export interface QueueEntry {
  /**
   * The song's id: a Spotify URI or a custom song's folder.
   */
  id: string;

  /**
   * The song's title.
   */
  title: string;

  /**
   * The artist, if known.
   */
  artist: string | null;

  /**
   * The cover art's URL, if any.
   */
  art: string | null;

  /**
   * Where it came from.
   */
  source: QueueSource;
}

/**
 * What the music player is doing, for the panels and Incognito.
 */
export interface MusicStatus {
  /**
   * Whether music is playing now (not paused or stopped).
   */
  playing: boolean;

  /**
   * The song playing (or paused), if any.
   */
  current: QueueEntry | null;

  /**
   * The songs queued after it, in order.
   */
  upNext: QueueEntry[];

  /**
   * The last playback error to show, if any.
   */
  error: string | null;
}

/**
 * The status before anything has played.
 */
export const IDLE_MUSIC: MusicStatus = { playing: false, current: null, upNext: [], error: null };
