// Local Imports
import {
  SONG_FADE_IN,
  SONG_LEVEL_FALL,
  SONG_LEVEL_RISE,
  SONG_SYNC_TOLERANCE,
  SONG_TICK_MS,
} from '../../config/audio';

// Types
import type { Song } from '../../types/music';

/**
 * The page's global object, where the song set outlives a hot reload.
 */
const page = globalThis as typeof globalThis & { graveyardSongs?: Set<{ stop(): void }> };

/**
 * Every song not yet stopped. Only one may play: a new one stops the rest,
 * so no song is ever left playing where nothing can reach it. Kept on the
 * page's global object so songs from before a hot reload are found too.
 */
const songs = (page.graveyardSongs ??= new Set());

if (import.meta.hot) {
  import.meta.hot.accept((): void => window.location.reload());
}

/**
 * Plays one song's parts in step, each at its own level, which eases toward
 * whatever `target` says for that part. Play and pause can come in any
 * order while the parts are still loading; the last one asked wins.
 */
export class SongPlayer {
  /**
   * Each part's audio and current level.
   */
  private _parts: { name: string; audio: HTMLAudioElement; level: number }[];

  /**
   * Resolves once every part can play through (or failed to load).
   */
  private _ready: Promise<void>;

  /**
   * The fade-in so far, 0..1.
   */
  private _fade = 0;

  /**
   * The music volume, 0..1.
   */
  private _volume = 1;

  /**
   * The tick interval while playing.
   */
  private _timer: ReturnType<typeof setInterval> | null = null;

  /**
   * Whether the song has stopped for good.
   */
  private _stopped = false;

  /**
   * Whether the last call asked it to play.
   */
  private _wanted = false;

  /**
   * Loads a song's parts and stops every other song.
   *
   * @param song - The song.
   * @param _target - Each part's level to ease toward, by part name.
   * @param _onEnd - Called once the song plays to its end.
   * @param _onPlaying - Called as it starts or stops playing.
   */
  constructor(
    song: Song,
    private _target: (part: string) => number,
    private _onEnd: () => void,
    private _onPlaying: (playing: boolean) => void,
  ) {
    for (const other of songs) {
      other.stop();
    }
    songs.add(this);
    this._parts = song.parts.map(({ name, url }) => {
      const audio = new Audio(url);
      audio.preload = 'auto';
      audio.volume = 0;
      return { name, audio, level: _target(name) };
    });
    this._ready = Promise.all(this._parts.map(({ audio }): Promise<void> => new Promise((resolve): void => {
      if (audio.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
        resolve();
        return;
      }
      audio.addEventListener('canplaythrough', (): void => resolve(), { once: true });
      audio.addEventListener('error', (): void => resolve(), { once: true });
    }))).then((): void => {});
    this._parts[0].audio.addEventListener('ended', (): void => {
      if (!this._stopped) {
        this.stop();
        this._onEnd();
      }
    });
  }

  /**
   * Whether the song is paused (or not started).
   *
   * @returns True unless the first part is playing.
   */
  get paused(): boolean {
    return this._parts[0].audio.paused;
  }

  /**
   * Sets the song's volume.
   *
   * @param volume - 0..1.
   */
  setVolume(volume: number): void {
    this._volume = volume;
  }

  /**
   * Starts (or resumes) every part together, once all of them can play
   * through.
   */
  async play(): Promise<void> {
    this._wanted = true;
    await this._ready;
    if (this._stopped || !this._wanted) {
      return;
    }
    const at = this._parts[0].audio.currentTime;
    for (const { audio } of this._parts) {
      audio.currentTime = at;
    }
    try {
      await Promise.all(this._parts.map(({ audio }): Promise<void> => audio.play()));
    } catch {
      this.pause();
      return;
    }
    if (this._stopped || !this._wanted) {
      this.halt();
      return;
    }
    this._timer ??= setInterval((): void => this.tick(), SONG_TICK_MS);
    this._onPlaying(true);
  }

  /**
   * Pauses every part.
   */
  pause(): void {
    this._wanted = false;
    this.halt();
    this._onPlaying(false);
  }

  /**
   * Stops for good and lets go of the audio.
   */
  stop(): void {
    this._stopped = true;
    this._wanted = false;
    songs.delete(this);
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
    for (const { audio } of this._parts) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
  }

  /**
   * Pauses every part without changing what's wanted.
   */
  private halt(): void {
    for (const { audio } of this._parts) {
      audio.pause();
    }
  }

  /**
   * Eases each part toward its level and keeps the parts in step.
   */
  private tick(): void {
    if (!this._wanted) {
      this.halt();
      return;
    }
    if (this.paused) {
      return;
    }
    const dt = SONG_TICK_MS / 1000;
    this._fade = Math.min(1, this._fade + dt / SONG_FADE_IN);
    const lead = this._parts[0].audio.currentTime;
    for (const part of this._parts) {
      const goal = this._target(part.name);
      part.level = part.level < goal ? Math.min(goal, part.level + SONG_LEVEL_RISE * dt) : Math.max(goal, part.level - SONG_LEVEL_FALL * dt);
      part.audio.volume = Math.min(1, Math.max(0, this._volume * this._fade * part.level));
      if (Math.abs(part.audio.currentTime - lead) > SONG_SYNC_TOLERANCE) {
        part.audio.currentTime = lead;
      }
    }
  }
}
