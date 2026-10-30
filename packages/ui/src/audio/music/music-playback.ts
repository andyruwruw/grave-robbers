// Local Imports
import {
  END_LEAD,
  FADE_OUT,
  PENDING_TIMEOUT,
} from '../../config/audio';
import { partLevel } from '../../helpers/music';
import { playlistTracks, spotifyQueue, toTrack } from '../spotify/spotify-api';
import { MusicState } from './music-state';

// Types
import type { Song } from '../../types/music';
import type { SpotifyPlaybackState, SpotifyTrack } from '../../types/spotify';

/**
 * How the music player's songs take turns: moving on to the next song,
 * reading the account's queue and the playlist, and keeping Spotify and
 * the custom songs from playing at once. This is what runs on its own
 * between the controls (timers, Spotify events, songs ending).
 */
export abstract class MusicPlayback extends MusicState {
  /**
   * Starts the next song if nothing is playing.
   */
  protected start(): void {
    if (this._enabled && !this._current && this._wantPlaying && (this._queue.upcoming.length > 0 || this._queue.userQueue.length > 0)) {
      this.advance();
    }
  }

  /**
   * Moves on to the next song: the account's queue first, then the
   * player's own queue (refilled when it runs out).
   */
  protected advance(): void {
    if (this._disposed || !this._enabled) {
      return;
    }
    this._custom.stop();
    this._ending = false;
    if (this._options.live && this._queue.userQueue.length > 0) {
      this.playQueued();
      return;
    }
    if (this._queue.upcoming.length === 0) {
      this.rebuild();
    }
    const next = this._queue.shift();
    this._current = next;
    if (!next) {
      this._playing = false;
      this._spotify.pause();
    } else if (next.kind === 'custom') {
      this._spotify.pause();
      this.playSong(next.song);
    } else {
      this.playSpotify(next.track.uri);
    }
    this.publish();
  }

  /**
   * Plays a custom song, following the game's mood.
   *
   * @param song - The song.
   */
  private playSong(song: Song): void {
    if (this._disposed) {
      return;
    }
    this._custom.playSong(
      song,
      (part: string): number => partLevel(part, this._mood),
      (): void => this.advance(),
      (playing: boolean): void => {
        this._playing = playing;
        this.publish();
      },
    );
    this.applyVolume();
    if (this._wantPlaying) {
      this._custom.resume();
    }
    void this._tags.trackTags(song.tagUrl).then((): void => this.publish());
  }

  /**
   * Plays a playlist track, unless something else took the turn while
   * Spotify connected.
   *
   * @param uri - The track.
   */
  private playSpotify(uri: string): void {
    void this._spotify.playUri(uri, (): boolean => this._current?.kind !== 'spotify' || this._current.track.uri !== uri || !this._enabled);
  }

  /**
   * Plays the head of the account's queue.
   */
  private playQueued(): void {
    const track = this._queue.userQueue.shift()!;
    this._current = { kind: 'spotify', track, source: 'queue' };
    void this._spotify.playQueued(track);
  }

  /**
   * Fades a Spotify track out over its last seconds and starts the next
   * song just before it ends, unless something is queued on the account,
   * which Spotify plays next by itself.
   */
  protected watch(): void {
    this.enforce();
    const cur = this._current;
    if (cur?.kind !== 'spotify' || !this._spotify.state || this._spotify.pending || this._ending) {
      return;
    }
    const { state, at } = this._spotify.state;
    if (state.paused || state.track_window.current_track?.uri !== cur.track.uri) {
      return;
    }
    const left = (state.duration - state.position - (performance.now() - at)) / 1000;
    const fade = this._options.live && this._queue.userQueue.length > 0 ? 1 : Math.max(0, Math.min(1, (left - END_LEAD) / (FADE_OUT - END_LEAD)));
    if (fade !== this._spotify.fade) {
      this._spotify.fade = fade;
      this.applyVolume();
    }
    if (left < END_LEAD && fade < 1) {
      this._ending = true;
      this._spotify.pause();
      this.advance();
    }
  }

  /**
   * Keeps one thing playing at most, whatever events were missed: no song
   * while Spotify has the turn, no Spotify while a song (or nothing) does,
   * and nothing at all while paused.
   */
  private enforce(): void {
    const cur = this._current;
    if (this._custom.song && cur?.kind !== 'custom') {
      this._custom.stop();
    }
    if (this._custom.song && !this._wantPlaying && !this._custom.song.paused) {
      this._custom.song.pause();
    }
    const spotifyPlaying = this._spotify.state && !this._spotify.state.state.paused;
    const now = performance.now() / 1000;
    if (spotifyPlaying && !this._spotify.pending && now > this._spotify.quietUntil && cur?.kind !== 'spotify') {
      this._spotify.pause();
    }
  }

  /**
   * Reads what's queued on the account. Its order wins, so moves and new
   * additions on a phone (or in a Jam) show up here and play first.
   */
  protected async pollQueue(): Promise<void> {
    if (!this._options.live) {
      return;
    }
    try {
      const queue = await spotifyQueue();
      if (!this._options.live) {
        return;
      }
      this._queue.userQueue = queue;
      this.publish();
      this.start();
    } catch {
      // Not linked or offline: try again next poll.
    }
  }
  /**
   * Reads a playlist's tracks and queues them, if it's still the one
   * chosen.
   *
   * @param uri - The playlist.
   */
  protected async loadPlaylist(uri: string): Promise<void> {
    try {
      const tracks = await playlistTracks(uri);
      if (this._options.playlist !== uri) {
        return;
      }
      this._playlist = { uri, tracks };
      this._error = tracks.length === 0 ? 'That playlist has nothing Spotify will play here.' : null;
      this.rebuild();
      this.start();
    } catch (err) {
      this.fail((err as Error).message);
      this.publish();
    }
  }

  /**
   * Follows what Spotify reports: a track asked for starting, or someone
   * starting a different one from a phone, which takes the turn.
   *
   * @param state - The new state, or null once the device isn't playing.
   */
  protected onSpotifyState(state: SpotifyPlaybackState | null): void {
    if (this._disposed) {
      return;
    }
    this._spotify.deviceActive = state !== null;
    if (!state) {
      return;
    }
    this._spotify.state = { state, at: performance.now() };
    const playing = state.track_window.current_track;
    const now = performance.now() / 1000;
    if (this._spotify.pending && (playing?.uri === this._spotify.pending.uri || now - this._spotify.pending.at > PENDING_TIMEOUT)) {
      this._spotify.pending = null;
    }
    if (this._spotify.pending || !playing) {
      return;
    }
    const cur = this._current;
    const ours = cur?.kind === 'spotify' && cur.track.uri === playing.uri;
    if (!ours && !state.paused && !this._ending && now > this._spotify.quietUntil) {
      const at = this._queue.userQueue.findIndex((t: SpotifyTrack): boolean => t.uri === playing.uri);
      const track = at >= 0 ? this._queue.userQueue.splice(at, 1)[0] : toTrack(playing);
      this._custom.stop();
      this._current = { kind: 'spotify', track, source: 'queue' };
      this._spotify.fade = 1;
      this.applyVolume();
    }
    if (this._current?.kind === 'spotify') {
      this._playing = !state.paused;
    }
    this.publish();
  }
}
