// Local Imports
import { loadMedia } from './media';
import {
  RECIPES,
  Synth,
} from './synth';

// Types
import type { SfxName } from './synth';

export type { SfxName } from './synth';


/**
 * How one play of a sound comes out.
 */
export interface PlayOptions {
  /**
   * 0..1 on top of the master volume.
   */
  volume?: number;

  /**
   * -1 (left) to 1 (right).
   */
  pan?: number;

  /**
   * Pitch multiplier (also playback speed for mp3 overrides).
   */
  pitch?: number;
}

/**
 * Plays sound effects through one AudioContext: synthesized recipes, or a
 * decoded mp3 when the server's media folder has one with the same name
 * (`server/media/sfx/<name>.mp3`). Also loops an ambience track under
 * everything (streamed, not decoded, since it's long) at its own volume.
 * Browsers start audio suspended until a user gesture, so nothing plays
 * until `unlock()`.
 */
/**
 * Sound effects play this much louder than their recipes, through a
 * limiter so a pile-up doesn't clip.
 */
const SFX_BOOST = 2.4;

export class SfxEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private volume = 0.8;
  private buffers = new Map<string, AudioBuffer>();
  private loading = false;
  private ambience: HTMLAudioElement | null = null;
  private ambienceUrl: string | null = null;
  private ambienceGain: GainNode | null = null;
  private ambienceVolume = 0.35;

  get unlocked(): boolean {
    return this.ctx?.state === 'running';
  }

  /**
   * Resumes audio; call from a click, tap, or key press.
   */
  async unlock(): Promise<void> {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.volume * SFX_BOOST;
      const limiter = this.ctx.createDynamicsCompressor();
      limiter.threshold.value = -6;
      limiter.knee.value = 6;
      limiter.ratio.value = 12;
      limiter.attack.value = 0.003;
      limiter.release.value = 0.15;
      this.master.connect(limiter).connect(this.ctx.destination);
    }
    if (this.ctx.state !== 'running') {
      await this.ctx.resume();
    }
    this.loadOverrides(this.ctx);
    this.startAmbience();
  }

  /**
   * Loops this track under everything (null stops it) at `volume`, apart
   * from the sound effects volume. Starts once audio is unlocked.
   */
  setAmbience(url: string | null, volume: number): void {
    this.ambienceUrl = url;
    this.ambienceVolume = volume;
    if (this.ambienceGain) {
      this.ambienceGain.gain.value = volume;
    }
    this.startAmbience();
  }

  private startAmbience(): void {
    const { ctx, master } = this;
    if (this.ambience && this.ambience.dataset.src !== this.ambienceUrl) {
      this.ambience.pause();
      this.ambience = null;
    }
    if (!this.ambienceUrl || !ctx || !master || this.ambience) {
      return;
    }
    const audio = new Audio(this.ambienceUrl);
    audio.dataset.src = this.ambienceUrl;
    audio.loop = true;
    this.ambienceGain ??= ctx.createGain();
    this.ambienceGain.gain.value = this.ambienceVolume;
    this.ambienceGain.connect(ctx.destination);
    ctx.createMediaElementSource(audio).connect(this.ambienceGain);
    this.ambience = audio;
    void audio.play().catch((): void => {
      this.ambience = null;
    });
  }

  setVolume(volume: number): void {
    this.volume = volume;
    if (this.master) {
      this.master.gain.value = volume * SFX_BOOST;
    }
  }

  play(name: SfxName, { volume = 1, pan = 0, pitch = 1 }: PlayOptions = {}): void {
    const { ctx, master } = this;
    if (!ctx || !master || ctx.state !== 'running') {
      return;
    }
    const out = ctx.createGain();
    out.gain.value = volume;
    const panner = ctx.createStereoPanner();
    panner.pan.value = Math.max(-1, Math.min(1, pan));
    out.connect(panner).connect(master);
    const buffer = this.buffers.get(name);
    if (buffer) {
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.playbackRate.value = pitch;
      src.connect(out);
      src.start();
      return;
    }
    RECIPES[name](new Synth(ctx, out, ctx.currentTime, pitch));
  }

  /**
   * Decodes every mp3 override from the server once. Until one is ready its
   * synth recipe plays instead.
   */
  private loadOverrides(ctx: AudioContext): void {
    if (this.loading) {
      return;
    }
    this.loading = true;
    void loadMedia().then(({ sfx }): void => {
      for (const { name, url } of sfx) {
        fetch(url)
          .then((res: Response): Promise<ArrayBuffer> => res.arrayBuffer())
          .then((data: ArrayBuffer): Promise<AudioBuffer> => ctx.decodeAudioData(data))
          .then((buffer: AudioBuffer): void => {
            this.buffers.set(name, buffer);
          })
          .catch((err: unknown): void => console.warn(`[sfx] couldn't load ${url}`, err));
      }
    });
  }
}

/**
 * The page's one sound effects engine.
 */
export const sfx = new SfxEngine();

if (import.meta.hot) {
  import.meta.hot.dispose((): void => sfx.setAmbience(null, 0));
}
