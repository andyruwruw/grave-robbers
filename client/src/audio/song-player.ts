/**
 * A song to play: one mp3, or several parts (bass, drums, melody, ...) that
 * play together and can be mixed in and out.
 */
export interface Song {
  title: string;

  /**
   * Title and artist that win over the ID3 tag (from `meta.json`).
   */
  fixedTitle: string | null;
  artist: string | null;
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
 * Seconds the whole song takes to fade in.
 */
const FADE_IN = 1.5;

/**
 * How fast a part's level rises and falls, per second.
 */
const LEVEL_RISE = 0.7;
const LEVEL_FALL = 0.25;

/**
 * Seconds a part may drift from the first before it's pulled back in line.
 */
const SYNC_TOLERANCE = 0.08;
const TICK_MS = 100;

/**
 * Every song not yet stopped. Only one may play: a new one stops the rest,
 * so no song is ever left playing where nothing can reach it. Kept on the
 * page's global object so songs from before a hot reload are found too.
 */
const page = globalThis as typeof globalThis & { graveyardSongs?: Set<{ stop(): void }> };
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
  private parts: { name: string; audio: HTMLAudioElement; level: number }[];
  private ready: Promise<void>;
  private fade = 0;
  private volume = 1;
  private timer: ReturnType<typeof setInterval> | null = null;
  private stopped = false;
  private wanted = false;

  constructor(
    song: Song,
    private target: (part: string) => number,
    private onEnd: () => void,
    private onPlaying: (playing: boolean) => void,
  ) {
    for (const other of songs) {
      other.stop();
    }
    songs.add(this);
    this.parts = song.parts.map(({ name, url }) => {
      const audio = new Audio(url);
      audio.preload = 'auto';
      audio.volume = 0;
      return { name, audio, level: target(name) };
    });
    this.ready = Promise.all(this.parts.map(({ audio }): Promise<void> => new Promise((resolve): void => {
      if (audio.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
        resolve();
        return;
      }
      audio.addEventListener('canplaythrough', (): void => resolve(), { once: true });
      audio.addEventListener('error', (): void => resolve(), { once: true });
    }))).then((): void => {});
    this.parts[0].audio.addEventListener('ended', (): void => {
      if (!this.stopped) {
        this.stop();
        this.onEnd();
      }
    });
  }

  get paused(): boolean {
    return this.parts[0].audio.paused;
  }

  setVolume(volume: number): void {
    this.volume = volume;
  }

  /**
   * Starts (or resumes) every part together, once all of them can play
   * through.
   */
  async play(): Promise<void> {
    this.wanted = true;
    await this.ready;
    if (this.stopped || !this.wanted) {
      return;
    }
    const at = this.parts[0].audio.currentTime;
    for (const { audio } of this.parts) {
      audio.currentTime = at;
    }
    try {
      await Promise.all(this.parts.map(({ audio }): Promise<void> => audio.play()));
    } catch {
      this.pause();
      return;
    }
    if (this.stopped || !this.wanted) {
      this.halt();
      return;
    }
    this.timer ??= setInterval((): void => this.tick(), TICK_MS);
    this.onPlaying(true);
  }

  pause(): void {
    this.wanted = false;
    this.halt();
    this.onPlaying(false);
  }

  stop(): void {
    this.stopped = true;
    this.wanted = false;
    songs.delete(this);
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    for (const { audio } of this.parts) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
  }

  private halt(): void {
    for (const { audio } of this.parts) {
      audio.pause();
    }
  }

  private tick(): void {
    if (!this.wanted) {
      this.halt();
      return;
    }
    if (this.paused) {
      return;
    }
    const dt = TICK_MS / 1000;
    this.fade = Math.min(1, this.fade + dt / FADE_IN);
    const lead = this.parts[0].audio.currentTime;
    for (const part of this.parts) {
      const goal = this.target(part.name);
      part.level = part.level < goal ? Math.min(goal, part.level + LEVEL_RISE * dt) : Math.max(goal, part.level - LEVEL_FALL * dt);
      part.audio.volume = Math.min(1, Math.max(0, this.volume * this.fade * part.level));
      if (Math.abs(part.audio.currentTime - lead) > SYNC_TOLERANCE) {
        part.audio.currentTime = lead;
      }
    }
  }
}
