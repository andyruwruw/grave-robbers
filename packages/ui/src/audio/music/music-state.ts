// Local Imports
import { CustomSongSource } from './custom-song-source';
import { MusicDucker } from './music-ducker';
import { MusicQueue } from './music-queue';
import { SpotifySource } from './spotify-source';
import { TrackTags } from './track-tags';

// Types
import type { MusicStatus, QueueEntry } from '@halloween/shared/audio/music-status';
import type { MusicSource } from './music-source';
import type {
  MusicMood,
  MusicOptions,
  QueueItem,
  Song,
} from '../../types/music';
import type { SpotifyPlaybackState, SpotifyTrack } from '../../types/spotify';

/**
 * What the music player knows: its settings, what plays now, its queue,
 * its two sources, and how it reports and sets the volume. `MusicPlayback`
 * adds how songs take turns and `MusicPlayer` the controls, so each part
 * reads on its own.
 */
export abstract class MusicState {
  /**
   * The Music tab's choices.
   */
  protected _options: MusicOptions = {
    live: false,
    spotify: false,
    custom: false,
    playlist: null,
    spotifyWeight: 1,
    customWeight: 1,
  };

  /**
   * The custom songs from the server's media folder.
   */
  protected _songs: Song[] = [];

  /**
   * The chosen playlist, once its tracks are read.
   */
  protected _playlist: { uri: string; tracks: SpotifyTrack[] } | null = null;

  /**
   * What has the turn now.
   */
  protected _current: QueueItem | null = null;

  /**
   * Whether the current song is audibly playing.
   */
  protected _playing = false;

  /**
   * The error shown under the music.
   */
  protected _error: string | null = null;

  /**
   * What the game is doing, for songs split into parts.
   */
  protected _mood: MusicMood = { players: false, fight: false, drums: 0 };

  /**
   * Whether the music should play (false once paused from the Music tab).
   */
  protected _wantPlaying = true;

  /**
   * The music volume, 0..1, before any duck.
   */
  protected _volume = 0.5;

  /**
   * Whether a Spotify track is ending and the next song was started.
   */
  protected _ending = false;

  /**
   * The watch and queue poll intervals.
   */
  protected _timers: ReturnType<typeof setInterval>[] = [];

  /**
   * Whether the player has stopped for good.
   */
  protected _disposed = false;

  /**
   * Whether this TV page plays the music (the server picks one when
   * several are open).
   */
  protected _enabled = true;

  /**
   * What plays next.
   */
  protected _queue = new MusicQueue();

  /**
   * The custom songs' ID3 tags.
   */
  protected _tags = new TrackTags();

  /**
   * Dips the music under big sound effects.
   */
  protected _ducker = new MusicDucker((): void => this.applyVolume());

  /**
   * Plays the custom songs.
   */
  protected _custom = new CustomSongSource();

  /**
   * Plays the Spotify tracks.
   */
  protected _spotify = new SpotifySource({
    isEnabled: (): boolean => this._enabled,
    isDisposed: (): boolean => this._disposed,
    volume: (): number => this._volume * this._ducker.level,
    onState: (state: SpotifyPlaybackState | null): void => this.onSpotifyState(state),
    fail: (message: string): void => this.fail(message),
    publish: (): void => this.publish(),
    applyVolume: (): void => this.applyVolume(),
    clearError: (): void => {
      this._error = null;
    },
  });

  /**
   * Sets up the player's state.
   *
   * @param _onChange - Called with the music status whenever it changes.
   */
  constructor(protected _onChange: (status: MusicStatus) => void) {}

  /**
   * Shows an error under the music, except the one the Spotify player
   * reports when asked to pause or resume with nothing loaded, which isn't
   * a problem.
   *
   * @param message - What went wrong.
   */
  protected fail(message: string): void {
    if (/no list was loaded/i.test(message)) {
      return;
    }
    this._error = message;
    this.publish();
  }

  /**
   * Refills the queue (`MusicQueue.rebuild`) and lists it.
   */
  protected rebuild(): void {
    this._queue.rebuild(this._options, this._playlist, this._songs);
    this.loadTitles();
    this.publish();
  }

  /**
   * Reads the tags of the custom songs coming up soon.
   */
  protected loadTitles(): void {
    this._tags.loadTitles(this._queue.upcoming, (): void => this.publish());
  }

  /**
   * The source that plays a queue item.
   *
   * @param item - The item, or null with nothing playing.
   * @returns Its source, or null.
   */
  protected sourceOf(item: QueueItem | null): MusicSource | null {
    return item?.kind === 'custom' ? this._custom : item?.kind === 'spotify' ? this._spotify : null;
  }

  /**
   * Sends the music status out: what's playing and what's up next.
   */
  protected publish(): void {
    if (this._disposed) {
      return;
    }
    const upNext = this._queue.upNextItems(this._options.live).map((item: QueueItem): QueueEntry => this._tags.entry(item, false));
    this._onChange({
      playing: this._playing,
      current: this._current ? this._tags.entry(this._current, true) : null,
      upNext,
      error: this._error,
    });
  }

  /**
   * Applies the volume, under any duck, to both sources.
   */
  protected applyVolume(): void {
    const v = this._volume * this._ducker.level;
    this._custom.setVolume(v);
    this._spotify.setVolume(v);
  }

  /**
   * Follows what Spotify reports (`MusicPlayback`).
   *
   * @param state - The new state, or null once the device isn't playing.
   */
  protected abstract onSpotifyState(state: SpotifyPlaybackState | null): void;
}
