// Types
import type { NoiseOptions, ToneOptions } from '../../types/sfx';

/**
 * White noise buffers, one per audio context.
 */
const noiseBuffers = new WeakMap<BaseAudioContext, AudioBuffer>();

/**
 * Two seconds of white noise for `ctx`, made once per context.
 *
 * @param ctx - The audio context.
 * @returns The shared noise buffer.
 */
function noiseBuffer(ctx: BaseAudioContext): AudioBuffer {
  let buffer = noiseBuffers.get(ctx);
  if (!buffer) {
    buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    noiseBuffers.set(ctx, buffer);
  }
  return buffer;
}

/**
 * Schedules tones and noise bursts into `out`, starting at `start` and with
 * every pitch scaled by `pitch` (for a little per-play variety).
 */
export class Synth {
  /**
   * Makes a synth for one play of a sound.
   *
   * @param _ctx - The audio context.
   * @param _out - Where every tone and burst connects.
   * @param _start - Context time (seconds) the sound starts at.
   * @param _pitch - Multiplier on every frequency.
   */
  constructor(private _ctx: AudioContext, private _out: AudioNode, private _start: number, private _pitch: number) {}

  /**
   * Schedules one enveloped oscillator.
   *
   * @param o - The tone's shape.
   */
  tone(o: ToneOptions): void {
    const ctx = this._ctx;
    const t = this._start + (o.at ?? 0);
    const osc = ctx.createOscillator();
    osc.type = o.type ?? 'square';
    osc.frequency.setValueAtTime(o.from * this._pitch, t);
    if (o.to) {
      osc.frequency.exponentialRampToValueAtTime(o.to * this._pitch, t + o.dur);
    }
    if (o.vibrato) {
      const lfo = ctx.createOscillator();
      const depth = ctx.createGain();
      lfo.frequency.value = o.vibrato[0];
      depth.gain.value = o.vibrato[1] * this._pitch;
      lfo.connect(depth).connect(osc.frequency);
      lfo.start(t);
      lfo.stop(t + o.dur);
    }
    let node: AudioNode = osc;
    if (o.lowpass) {
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(o.lowpass[0], t);
      filter.frequency.exponentialRampToValueAtTime(o.lowpass[1], t + o.dur);
      node = osc.connect(filter);
    }
    node.connect(this.envelope(t, o.attack ?? 0.005, o.dur, o.gain));
    osc.start(t);
    osc.stop(t + o.dur + 0.05);
  }

  /**
   * Schedules one burst of filtered noise.
   *
   * @param o - The burst's shape.
   */
  noise(o: NoiseOptions): void {
    const ctx = this._ctx;
    const t = this._start + (o.at ?? 0);
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = o.filter;
    filter.Q.value = o.q ?? 1;
    filter.frequency.setValueAtTime(o.from * this._pitch, t);
    if (o.to) {
      filter.frequency.exponentialRampToValueAtTime(o.to * this._pitch, t + o.dur);
    }
    src.connect(filter).connect(this.envelope(t, o.attack ?? 0.003, o.dur, o.gain));
    src.start(t, Math.random());
    src.stop(t + o.dur + 0.05);
  }

  /**
   * A gain that rises to `peak` over `attack` and falls away by `dur`,
   * connected to the output.
   *
   * @param t - Context time it starts at.
   * @param attack - Seconds to the peak.
   * @param dur - Seconds until it's silent.
   * @param peak - The peak gain.
   * @returns The envelope, to connect a source into.
   */
  private envelope(t: number, attack: number, dur: number, peak: number): GainNode {
    const g = this._ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    g.connect(this._out);
    return g;
  }
}
