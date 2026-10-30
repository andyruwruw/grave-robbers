// Local Imports
import {
  AMBIENCE_FADE,
  AMBIENCE_TICK_MS,
} from '../../config/audio';

// Types
import type { AmbienceVoice } from '../../types/sfx';

/**
 * The ambience tracks under everything (streamed, not decoded, since
 * they're long) at their own volume, one after another and around again,
 * each crossfading into the next over AMBIENCE_FADE so there's never a gap
 * at the loop.
 */
export class AmbienceLoop {
  /**
   * The tracks, in order.
   */
  private _urls: string[] = [];

  /**
   * Which track plays (or plays next).
   */
  private _index = 0;

  /**
   * The tracks playing, the newest last.
   */
  private _voices: AmbienceVoice[] = [];

  /**
   * The crossfade check interval.
   */
  private _timer: ReturnType<typeof setInterval> | null = null;

  /**
   * The ambience volume, under every voice.
   */
  private _gain: GainNode | null = null;

  /**
   * The ambience volume, 0..1.
   */
  private _volume = 0.35;

  /**
   * Makes the loop for an engine's context.
   *
   * @param _context - Reads the engine's context, null until audio is unlocked.
   */
  constructor(private readonly _context: () => AudioContext | null) {}

  /**
   * Plays these tracks (none stops it) at `volume`. Starts once audio is
   * unlocked.
   *
   * @param urls - The tracks, in order.
   * @param volume - 0..1, apart from the sound effects volume.
   */
  set(urls: string[], volume: number): void {
    this._volume = volume;
    if (this._gain) {
      this._gain.gain.value = volume;
    }
    if (urls.join('|') !== this._urls.join('|')) {
      this._urls = urls;
      this._index = 0;
      this.stop();
    }
    this.start();
  }

  /**
   * Stops every track and the crossfade timer.
   */
  stop(): void {
    for (const voice of this._voices) {
      voice.audio.pause();
      voice.gain.disconnect();
    }
    this._voices = [];
    if (this._timer) {
      clearInterval(this._timer);
      this._timer = null;
    }
  }

  /**
   * Starts the first track if there are tracks, audio is unlocked, and
   * nothing plays yet.
   */
  start(): void {
    const ctx = this._context();
    if (this._urls.length === 0 || !ctx || this._voices.length > 0) {
      return;
    }
    this._gain ??= ctx.createGain();
    this._gain.gain.value = this._volume;
    this._gain.connect(ctx.destination);
    this.playVoice(0);
    this._timer = setInterval((): void => this.crossfade(), AMBIENCE_TICK_MS);
  }

  /**
   * Starts the current track, fading in over `fade` seconds (0: at once).
   *
   * @param fade - Seconds to fade in over.
   */
  private playVoice(fade: number): void {
    const ctx = this._context()!;
    const audio = new Audio(this._urls[this._index]);
    const gain = ctx.createGain();
    ctx.createMediaElementSource(audio).connect(gain).connect(this._gain!);
    gain.gain.setValueAtTime(fade > 0 ? 0 : 1, ctx.currentTime);
    if (fade > 0) {
      gain.gain.linearRampToValueAtTime(1, ctx.currentTime + fade);
    }
    const voice: AmbienceVoice = { audio, gain, handedOff: false };
    this._voices.push(voice);
    void audio.play().catch((): void => {
      this._voices = this._voices.filter((v: AmbienceVoice): boolean => v !== voice);
    });
  }

  /**
   * As the newest track nears its end, fades it out and the next one (or
   * the same one again) in over the same stretch.
   */
  private crossfade(): void {
    const ctx = this._context();
    const current = this._voices.at(-1);
    if (!ctx || !current || current.handedOff || !Number.isFinite(current.audio.duration)) {
      return;
    }
    const { duration, currentTime } = current.audio;
    const fade = Math.min(AMBIENCE_FADE, duration / 3);
    if (duration - currentTime > fade) {
      return;
    }
    current.handedOff = true;
    const left = Math.max(0.05, duration - currentTime);
    current.gain.gain.setValueAtTime(current.gain.gain.value, ctx.currentTime);
    current.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + left);
    setTimeout((): void => {
      current.audio.pause();
      current.gain.disconnect();
      this._voices = this._voices.filter((v: AmbienceVoice): boolean => v !== current);
    }, left * 1000 + 100);
    this._index = (this._index + 1) % this._urls.length;
    this.playVoice(left);
  }
}
