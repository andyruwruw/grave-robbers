// Local Imports
import {
  QUEUE_POLL_MS,
  WATCH_MS,
} from '../../config/audio';
import { toSong } from '../../helpers/music';
import { loadMedia } from '../media/media';
import { MusicPlayback } from './music-playback';

// Types
import type { AudioSettings } from '@halloween/shared/audio/audio-settings';
import type { MusicStatus } from '@halloween/shared/audio/music-status';
import type { MusicMood } from '../../types/music';

/**
 * The player playing now, so a new one can stop it. Kept on the page's
 * global object, not in this module, so a copy of this module loaded by a
 * hot reload still finds and stops the old one.
 */
const page = globalThis as typeof globalThis & { graveyardMusic?: { dispose(): void } | null };

if (import.meta.hot) {
  import.meta.hot.accept((): void => window.location.reload());
}

/**
 * Background music for the TV, with its own queue: what's queued on the
 * linked Spotify account (from a phone or a Jam) always plays first, in
 * the account's order, then the chosen playlist shuffled with custom songs
 * shuffled in. Spotify tracks play one at a time on the Web Playback SDK
 * device (Spotify Premium) and fade out at the end; Spotify pauses while a
 * custom song plays. Custom songs split into parts follow the game's mood.
 * Can dip under big sound effects.
 */
export class MusicPlayer extends MusicPlayback {
  /**
   * Starts the music, stopping any player from before.
   *
   * @param onChange - Called with the music status whenever it changes.
   */
  constructor(onChange: (status: MusicStatus) => void) {
    super(onChange);
    page.graveyardMusic?.dispose();
    page.graveyardMusic = this;
    this._timers.push(
      setInterval((): void => this.watch(), WATCH_MS),
      setInterval((): void => void this.pollQueue(), QUEUE_POLL_MS),
    );
    void loadMedia().then(({ songs }): void => {
      if (this._disposed) {
        return;
      }
      this._songs = songs.map(toSong);
      this.rebuild();
      this.start();
    });
  }

  /**
   * Stops for good: its song, its Spotify connection, and its timers. Only
   * one player plays at a time; a new one disposes the last (the TV page
   * remounting, or a hot reload in dev).
   */
  dispose(): void {
    if (this._disposed) {
      return;
    }
    this._disposed = true;
    this._timers.forEach(clearInterval);
    this._ducker.dispose();
    this._custom.dispose();
    this._current = null;
    this._spotify.dispose();
    if (page.graveyardMusic === this) {
      page.graveyardMusic = null;
    }
  }

  /**
   * Plays the music here, or goes quiet because another TV page has it:
   * the song stops, Spotify pauses and lets go of its device.
   *
   * @param on - Whether this page plays the music.
   */
  setEnabled(on: boolean): void {
    if (on === this._enabled) {
      return;
    }
    this._enabled = on;
    if (on) {
      this._error = null;
      if (this._options.live || this._options.spotify) {
        void this._spotify.connect();
      }
      this.start();
    } else {
      this._custom.stop();
      this._current = null;
      this._playing = false;
      this._spotify.release();
      this._error = 'Music is playing on another TV page.';
    }
    this.publish();
  }

  /**
   * What the game is doing, for songs split into parts.
   *
   * @param mood - The game's mood.
   */
  setMood(mood: MusicMood): void {
    this._mood = mood;
  }

  /**
   * Applies the Music tab's choices: the account's queue first, the
   * playlist, the custom songs, or any mix. Whatever's playing keeps
   * playing unless its source was turned off.
   *
   * @param settings - The Music tab's settings.
   */
  setOptions({ live, spotify, custom, playlist, spotifyWeight, customWeight }: AudioSettings): void {
    const before = this._options;
    this._options = { live, spotify, custom, playlist, spotifyWeight, customWeight };
    if (!this._enabled) {
      return;
    }
    if (live || spotify) {
      void this._spotify.connect();
    } else {
      this._error = null;
    }
    if (live && !before.live) {
      void this.pollQueue();
    }
    if (!live) {
      this._queue.userQueue = [];
    }
    const playlistWanted = spotify && playlist ? playlist : null;
    if (playlistWanted && this._playlist?.uri !== playlistWanted) {
      void this.loadPlaylist(playlistWanted);
    }
    if (spotify !== before.spotify || custom !== before.custom || playlist !== before.playlist || spotifyWeight !== before.spotifyWeight || customWeight !== before.customWeight) {
      this.rebuild();
    }
    const cur = this._current;
    const stale = cur && (cur.kind === 'custom' ? !custom : cur.source === 'queue' ? !live : !spotify || playlist !== before.playlist);
    if (stale) {
      this.advance();
    } else {
      this.start();
    }
    this.publish();
  }

  /**
   * Sets the music volume.
   *
   * @param volume - 0..1.
   */
  setVolume(volume: number): void {
    this._volume = volume;
    this.applyVolume();
  }

  /**
   * Pauses or plays, whichever source has the turn.
   */
  toggle(): void {
    if (!this._enabled) {
      return;
    }
    this._wantPlaying = !this._playing;
    const source = this.sourceOf(this._current);
    if (source) {
      if (this._wantPlaying) {
        source.resume();
      } else {
        source.pause();
      }
    } else if (this._wantPlaying) {
      this.start();
    }
  }

  /**
   * Skips to the next song.
   */
  next(): void {
    if (!this._enabled) {
      return;
    }
    this._wantPlaying = true;
    this._spotify.pause();
    this.advance();
  }

  /**
   * Takes a song out of what's up next. Songs queued on the Spotify
   * account stay (Spotify can't unqueue them).
   *
   * @param index - Its place in the published list.
   * @param id - Its published id, which guards against the list having moved on.
   */
  remove(index: number, id: string): void {
    const at = this._queue.ownIndex(index, id, this._options.live);
    if (at !== null) {
      this._queue.remove(at);
      this.loadTitles();
      this.publish();
    }
  }

  /**
   * Moves a song in what's up next one place earlier or later (never
   * ahead of what's queued on the Spotify account).
   *
   * @param index - Its place in the published list.
   * @param id - Its published id.
   * @param delta - -1 for earlier, 1 for later.
   */
  move(index: number, id: string, delta: -1 | 1): void {
    const at = this._queue.ownIndex(index, id, this._options.live);
    if (!this._queue.move(at, delta)) {
      return;
    }
    this.loadTitles();
    this.publish();
  }

  /**
   * Retries playback after a user gesture, since browsers block audio that
   * starts on its own.
   */
  resume(): void {
    if (!this._enabled) {
      return;
    }
    this._spotify.activate();
    if (this._custom.song?.paused && this._wantPlaying) {
      void this._custom.song.play();
    }
  }

  /**
   * Dips the music to `depth` of its volume for `hold` seconds, then fades
   * it back.
   *
   * @param depth - The share of the volume to dip to.
   * @param hold - Seconds to stay down.
   */
  duck(depth = 0.35, hold = 1.5): void {
    this._ducker.duck(depth, hold);
  }
}
