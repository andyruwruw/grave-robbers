// Local Imports
import { SFX_BOOST } from '../../config/audio';
import { AmbienceLoop } from './ambience-loop';
import { RECIPES } from './recipes/sfx-recipes';
import { SfxOverrides } from './sfx-overrides';
import { Synth } from './synth';

// Types
import type { PlayOptions, SfxName } from '../../types/sfx';

/**
 * Plays sound effects through one AudioContext: synthesized recipes, or a
 * decoded mp3 when the server's media folder has one with the same name
 * (`server/media/sfx/<name>.mp3`). Also plays the ambience tracks under
 * everything (`AmbienceLoop`). Browsers start audio suspended until a user
 * gesture, so nothing plays until `unlock()`.
 */
export class SfxEngine {
  /**
   * The audio context, made on the first unlock.
   */
  private _ctx: AudioContext | null = null;

  /**
   * The master gain for every sound effect, into the limiter.
   */
  private _master: GainNode | null = null;

  /**
   * The sound effects volume, 0..1.
   */
  private _volume = 0.8;

  /**
   * The decoded mp3 overrides.
   */
  private _overrides = new SfxOverrides();

  /**
   * The ambience under everything.
   */
  private _ambience = new AmbienceLoop((): AudioContext | null => this._ctx);

  /**
   * Whether audio has been unlocked and is running.
   *
   * @returns True once sounds can play.
   */
  get unlocked(): boolean {
    return this._ctx?.state === 'running';
  }

  /**
   * Resumes audio; call from a click, tap, or key press.
   */
  async unlock(): Promise<void> {
    if (!this._ctx) {
      this._ctx = new AudioContext();
      this._master = this._ctx.createGain();
      this._master.gain.value = this._volume * SFX_BOOST;
      const limiter = this._ctx.createDynamicsCompressor();
      limiter.threshold.value = -6;
      limiter.knee.value = 6;
      limiter.ratio.value = 12;
      limiter.attack.value = 0.003;
      limiter.release.value = 0.15;
      this._master.connect(limiter).connect(this._ctx.destination);
    }
    if (this._ctx.state !== 'running') {
      await this._ctx.resume();
    }
    this._overrides.load(this._ctx);
    this._ambience.start();
  }

  /**
   * Plays these tracks under everything (none stops it) at `volume`, apart
   * from the sound effects volume. Starts once audio is unlocked.
   *
   * @param urls - The ambience tracks, in order.
   * @param volume - 0..1.
   */
  setAmbience(urls: string[], volume: number): void {
    this._ambience.set(urls, volume);
  }

  /**
   * Sets the sound effects volume.
   *
   * @param volume - 0..1.
   */
  setVolume(volume: number): void {
    this._volume = volume;
    if (this._master) {
      this._master.gain.value = volume * SFX_BOOST;
    }
  }

  /**
   * Plays one sound: its mp3 override if one is loaded, else its recipe.
   *
   * @param name - The sound.
   * @param options - Volume, pan, and pitch for this play.
   */
  play(name: SfxName, { volume = 1, pan = 0, pitch = 1 }: PlayOptions = {}): void {
    const ctx = this._ctx;
    const master = this._master;
    if (!ctx || !master || ctx.state !== 'running') {
      return;
    }
    const out = ctx.createGain();
    out.gain.value = volume;
    const panner = ctx.createStereoPanner();
    panner.pan.value = Math.max(-1, Math.min(1, pan));
    out.connect(panner).connect(master);
    const buffer = this._overrides.get(name);
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
}
