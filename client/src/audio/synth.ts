/**
 * Every sound effect in the game. Each has a synthesized recipe below; an
 * mp3 with the same name in `server/media/sfx/` replaces it.
 */
export type SfxName =
  | 'swing' | 'chop' | 'mine' | 'dig' | 'unlock' | 'hit' | 'hurt' | 'monster-hit' | 'bite'
  | 'build' | 'craft' | 'shadow-step' | 'ghoul-hiss' | 'ghoul-screech' | 'break' | 'pickup' | 'candy' | 'drop' | 'refuel' | 'snuff' | 'error'
  | 'death' | 'respawn' | 'monster-death' | 'blood-moon'
  | 'zombie-groan' | 'zombie-angry' | 'zombie-hurt' | 'vampire-hiss' | 'vampire-hurt' | 'ghost-moan' | 'ghost-shriek' | 'ghost-shot' | 'equip' | 'shoot' | 'splat' | 'drink';

/**
 * One enveloped oscillator: a pitch glide over `dur` seconds, optionally
 * with vibrato and a low-pass sweep.
 */
interface ToneOptions {
  type?: OscillatorType;
  from: number;
  to?: number;
  dur: number;
  gain: number;
  attack?: number;
  at?: number;
  vibrato?: [rate: number, depth: number];
  lowpass?: [from: number, to: number];
}

/**
 * One burst of filtered white noise, with a filter sweep over `dur`.
 */
interface NoiseOptions {
  filter: BiquadFilterType;
  from: number;
  to?: number;
  q?: number;
  dur: number;
  gain: number;
  attack?: number;
  at?: number;
}

const noiseBuffers = new WeakMap<BaseAudioContext, AudioBuffer>();

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
  constructor(private ctx: AudioContext, private out: AudioNode, private start: number, private pitch: number) {}

  tone(o: ToneOptions): void {
    const { ctx } = this;
    const t = this.start + (o.at ?? 0);
    const osc = ctx.createOscillator();
    osc.type = o.type ?? 'square';
    osc.frequency.setValueAtTime(o.from * this.pitch, t);
    if (o.to) {
      osc.frequency.exponentialRampToValueAtTime(o.to * this.pitch, t + o.dur);
    }
    if (o.vibrato) {
      const lfo = ctx.createOscillator();
      const depth = ctx.createGain();
      lfo.frequency.value = o.vibrato[0];
      depth.gain.value = o.vibrato[1] * this.pitch;
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

  noise(o: NoiseOptions): void {
    const { ctx } = this;
    const t = this.start + (o.at ?? 0);
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(ctx);
    const filter = ctx.createBiquadFilter();
    filter.type = o.filter;
    filter.Q.value = o.q ?? 1;
    filter.frequency.setValueAtTime(o.from * this.pitch, t);
    if (o.to) {
      filter.frequency.exponentialRampToValueAtTime(o.to * this.pitch, t + o.dur);
    }
    src.connect(filter).connect(this.envelope(t, o.attack ?? 0.003, o.dur, o.gain));
    src.start(t, Math.random());
    src.stop(t + o.dur + 0.05);
  }

  private envelope(t: number, attack: number, dur: number, peak: number): GainNode {
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    g.connect(this.out);
    return g;
  }
}

/**
 * Retro, slightly crunchy recipes for every sound.
 */
export const RECIPES: Record<SfxName, (s: Synth) => void> = {
  'swing': (s) => s.noise({ filter: 'bandpass', from: 700, to: 2600, q: 2, dur: 0.14, gain: 0.9, attack: 0.03 }),
  'chop': (s) => {
    s.tone({ from: 150, to: 70, dur: 0.09, gain: 0.3 });
    s.noise({ filter: 'lowpass', from: 1400, to: 400, dur: 0.06, gain: 0.35 });
  },
  'mine': (s) => {
    s.tone({ type: 'triangle', from: 1250, to: 950, dur: 0.14, gain: 0.22 });
    s.tone({ from: 2500, dur: 0.05, gain: 0.05 });
    s.noise({ filter: 'highpass', from: 3000, dur: 0.04, gain: 0.25 });
  },
  'dig': (s) => {
    s.noise({ filter: 'bandpass', from: 1800, to: 600, q: 1.5, dur: 0.12, gain: 0.45 });
    s.tone({ type: 'sine', from: 110, to: 55, dur: 0.14, gain: 0.4, at: 0.04 });
    s.noise({ filter: 'lowpass', from: 600, to: 200, dur: 0.18, gain: 0.3, at: 0.06 });
  },
  'unlock': (s) => {
    s.tone({ type: 'triangle', from: 523, dur: 0.12, gain: 0.18 });
    s.tone({ type: 'triangle', from: 659, dur: 0.12, gain: 0.18, at: 0.09 });
    s.tone({ type: 'triangle', from: 784, dur: 0.12, gain: 0.18, at: 0.18 });
    s.tone({ type: 'triangle', from: 1047, dur: 0.35, gain: 0.2, at: 0.27 });
  },
  'hit': (s) => {
    s.noise({ filter: 'lowpass', from: 1000, to: 300, dur: 0.09, gain: 0.5 });
    s.tone({ type: 'sine', from: 130, to: 50, dur: 0.13, gain: 0.55 });
  },
  'hurt': (s) => {
    s.noise({ filter: 'lowpass', from: 2200, to: 400, dur: 0.07, gain: 0.6 });
    s.tone({ type: 'sine', from: 170, to: 50, dur: 0.18, gain: 0.5 });
    s.tone({ type: 'sawtooth', from: 250, to: 140, dur: 0.24, gain: 0.16, attack: 0.015, at: 0.025, vibrato: [30, 7], lowpass: [1500, 450] });
    s.tone({ type: 'square', from: 520, to: 300, dur: 0.16, gain: 0.04, attack: 0.015, at: 0.025, lowpass: [1800, 700] });
  },
  'monster-hit': (s) => {
    s.noise({ filter: 'bandpass', from: 500, to: 150, q: 3, dur: 0.16, gain: 0.9 });
    s.tone({ type: 'sawtooth', from: 95, to: 60, dur: 0.12, gain: 0.18 });
  },
  'bite': (s) => {
    s.noise({ filter: 'lowpass', from: 800, to: 250, dur: 0.1, gain: 0.35 });
    s.tone({ from: 115, to: 60, dur: 0.13, gain: 0.2 });
  },
  'build': (s) => {
    s.tone({ type: 'sine', from: 210, to: 130, dur: 0.12, gain: 0.45 });
    s.noise({ filter: 'lowpass', from: 700, dur: 0.07, gain: 0.3 });
    s.tone({ type: 'triangle', from: 640, dur: 0.04, gain: 0.08, at: 0.02 });
  },
  'craft': (s) => {
    s.noise({ filter: 'bandpass', from: 2600, q: 6, dur: 0.04, gain: 0.35 });
    s.tone({ type: 'triangle', from: 1180, dur: 0.06, gain: 0.1 });
    s.noise({ filter: 'bandpass', from: 2300, q: 6, dur: 0.04, gain: 0.3, at: 0.11 });
    s.tone({ type: 'triangle', from: 1050, dur: 0.06, gain: 0.09, at: 0.11 });
    s.tone({ type: 'sine', from: 660, dur: 0.09, gain: 0.1, at: 0.22 });
    s.tone({ type: 'sine', from: 990, dur: 0.16, gain: 0.1, at: 0.3 });
  },
  'shadow-step': (s) => {
    s.noise({ filter: 'lowpass', from: 250, to: 1400, dur: 0.32, gain: 0.32, attack: 0.18 });
    s.noise({ filter: 'bandpass', from: 1100, to: 180, q: 0.8, dur: 0.75, gain: 0.34, at: 0.22, attack: 0.08 });
    s.tone({ type: 'sine', from: 92, to: 48, dur: 0.7, gain: 0.14, at: 0.1 });
    s.noise({ filter: 'highpass', from: 3200, to: 1800, dur: 0.5, gain: 0.06, at: 0.25 });
  },
  'ghoul-hiss': (s) => {
    s.noise({ filter: 'bandpass', from: 2600, to: 1500, q: 3, dur: 0.5, gain: 0.32, attack: 0.05 });
    for (let i = 0; i < 6; i++) {
      s.noise({ filter: 'highpass', from: 2800, dur: 0.015, gain: 0.28, at: 0.04 + i * 0.065 + Math.random() * 0.02 });
    }
    s.tone({ type: 'sawtooth', from: 150, to: 105, dur: 0.45, gain: 0.07 });
  },
  'ghoul-screech': (s) => {
    s.tone({ type: 'sawtooth', from: 850, to: 1750, dur: 0.16, gain: 0.11 });
    s.tone({ type: 'sawtooth', from: 1750, to: 520, dur: 0.38, gain: 0.11, at: 0.14 });
    s.tone({ type: 'square', from: 910, to: 1840, dur: 0.18, gain: 0.04 });
    s.noise({ filter: 'bandpass', from: 3200, to: 1100, q: 2, dur: 0.55, gain: 0.3 });
  },
  'break': (s) => {
    s.noise({ filter: 'lowpass', from: 2200, to: 250, dur: 0.38, gain: 0.5 });
    s.tone({ from: 95, to: 38, dur: 0.28, gain: 0.25 });
    s.noise({ filter: 'bandpass', from: 1200, q: 4, dur: 0.06, gain: 0.25, at: 0.12 });
  },
  'pickup': (s) => {
    s.tone({ from: 660, dur: 0.06, gain: 0.12 });
    s.tone({ from: 990, dur: 0.09, gain: 0.12, at: 0.06 });
  },
  'candy': (s) => {
    for (const [at, from] of [[0, 3200], [0.07, 2400], [0.13, 3600], [0.21, 2800], [0.27, 3000]]) {
      s.noise({ filter: 'bandpass', from, to: from * 0.6, q: 2.5, dur: 0.05, gain: 0.7, at });
    }
    s.tone({ type: 'triangle', from: 523, dur: 0.1, gain: 0.1, at: 0.34 });
    s.tone({ type: 'triangle', from: 659, dur: 0.1, gain: 0.1, at: 0.42 });
    s.tone({ type: 'triangle', from: 784, to: 1046, dur: 0.18, gain: 0.1, at: 0.5 });
  },
  'drop': (s) => s.tone({ from: 520, to: 240, dur: 0.11, gain: 0.13 }),
  'drink': (s) => {
    for (const at of [0, 0.16, 0.32]) {
      s.tone({ type: 'sine', from: 180, to: 420, dur: 0.1, gain: 0.12, at });
      s.noise({ filter: 'lowpass', from: 700, to: 300, dur: 0.08, gain: 0.25, at: at + 0.02 });
    }
    s.tone({ type: 'triangle', from: 660, to: 990, dur: 0.2, gain: 0.08, at: 0.5 });
  },
  'refuel': (s) => {
    s.noise({ filter: 'bandpass', from: 500, to: 1900, q: 1.5, dur: 0.32, gain: 0.8, attack: 0.08 });
    s.tone({ type: 'sine', from: 300, to: 520, dur: 0.22, gain: 0.07 });
  },
  'snuff': (s) => s.noise({ filter: 'highpass', from: 2200, to: 6000, dur: 0.45, gain: 0.22, attack: 0.04 }),
  'error': (s) => {
    s.tone({ from: 150, dur: 0.09, gain: 0.14 });
    s.tone({ from: 150, dur: 0.09, gain: 0.14, at: 0.13 });
  },
  'death': (s) => {
    s.tone({ from: 420, to: 60, dur: 0.85, gain: 0.22 });
    s.tone({ from: 315, to: 46, dur: 0.85, gain: 0.16, at: 0.04 });
  },
  'respawn': (s) => {
    [523, 659, 784, 1046].forEach((f: number, i: number): void => s.tone({ type: 'sine', from: f, dur: 0.12, gain: 0.14, at: i * 0.08 }));
  },
  'monster-death': (s) => {
    s.tone({ type: 'sawtooth', from: 230, to: 40, dur: 0.45, gain: 0.22 });
    s.noise({ filter: 'lowpass', from: 1600, to: 180, dur: 0.42, gain: 0.3 });
  },
  'blood-moon': (s) => {
    s.tone({ type: 'sawtooth', from: 55, dur: 3, gain: 0.28, attack: 0.7, lowpass: [300, 1100] });
    s.tone({ type: 'sawtooth', from: 82.5, dur: 3, gain: 0.2, attack: 0.9, lowpass: [300, 900] });
    s.tone({ type: 'sine', from: 41, dur: 3.2, gain: 0.35, attack: 0.5 });
  },
  'zombie-groan': (s) => {
    const f = 70 + Math.random() * 25;
    s.tone({ type: 'sawtooth', from: f, to: f * 0.8, dur: 1.1, gain: 0.16, attack: 0.25, vibrato: [5, 6], lowpass: [520, 300] });
  },
  'zombie-angry': (s) => {
    const f = 95 + Math.random() * 25;
    s.noise({ filter: 'bandpass', from: 420, to: 260, q: 2, dur: 0.65, gain: 0.3, attack: 0.04 });
    s.tone({ type: 'sawtooth', from: f, to: f * 1.45, dur: 0.3, gain: 0.2, attack: 0.04, vibrato: [16, 14], lowpass: [1100, 800] });
    s.tone({ type: 'sawtooth', from: f * 1.45, to: f * 0.8, dur: 0.45, gain: 0.2, at: 0.28, vibrato: [16, 14], lowpass: [900, 400] });
    s.tone({ type: 'square', from: 55, to: 45, dur: 0.6, gain: 0.05, attack: 0.05, lowpass: [300, 200] });
  },
  'zombie-hurt': (s) => {
    const f = 140 + Math.random() * 30;
    s.noise({ filter: 'lowpass', from: 900, to: 300, dur: 0.08, gain: 0.25 });
    s.tone({ type: 'sawtooth', from: f, to: f * 0.55, dur: 0.32, gain: 0.2, attack: 0.01, vibrato: [24, 10], lowpass: [1200, 400] });
  },
  'vampire-hurt': (s) => {
    s.noise({ filter: 'highpass', from: 2600, dur: 0.3, gain: 0.16, attack: 0.01 });
    s.tone({ type: 'sawtooth', from: 950, to: 560, dur: 0.38, gain: 0.08, attack: 0.01, vibrato: [32, 45], lowpass: [3600, 1600] });
    s.tone({ type: 'sine', from: 1500, to: 900, dur: 0.3, gain: 0.05 });
  },
  'vampire-hiss': (s) => {
    s.noise({ filter: 'highpass', from: 3600, dur: 0.55, gain: 0.2, attack: 0.05 });
    s.tone({ type: 'sine', from: 1800, to: 1300, dur: 0.2, gain: 0.03 });
  },
  'equip': (s) => {
    s.noise({ filter: 'bandpass', from: 1800, to: 900, q: 3, dur: 0.07, gain: 0.35 });
    s.tone({ type: 'triangle', from: 880, dur: 0.05, gain: 0.08, at: 0.05 });
    s.tone({ type: 'triangle', from: 1320, dur: 0.07, gain: 0.07, at: 0.09 });
  },
  'shoot': (s) => {
    s.tone({ type: 'triangle', from: 210, to: 90, dur: 0.12, gain: 0.3 });
    s.noise({ filter: 'bandpass', from: 2400, to: 900, q: 2, dur: 0.16, gain: 0.6 });
  },
  'splat': (s) => {
    s.noise({ filter: 'lowpass', from: 900, to: 160, dur: 0.22, gain: 0.55 });
    s.tone({ type: 'sine', from: 160, to: 55, dur: 0.18, gain: 0.3 });
    s.noise({ filter: 'bandpass', from: 600, q: 5, dur: 0.05, gain: 0.25, at: 0.08 });
  },
  'ghost-shot': (s) => {
    s.noise({ filter: 'bandpass', from: 2600, to: 900, q: 1.5, dur: 0.09, gain: 0.5 });
    s.tone({ type: 'square', from: 240, to: 90, dur: 0.08, gain: 0.08 });
    s.tone({ type: 'sine', from: 520, to: 260, dur: 0.6, gain: 0.09, attack: 0.04, vibrato: [11, 30] });
    s.tone({ type: 'triangle', from: 780, to: 390, dur: 0.5, gain: 0.04, attack: 0.04, vibrato: [9, 25] });
    s.noise({ filter: 'bandpass', from: 1400, to: 600, q: 4, dur: 0.5, gain: 0.12, attack: 0.05 });
  },
  'ghost-shriek': (s) => {
    s.tone({ type: 'sawtooth', from: 380, to: 1100, dur: 0.35, gain: 0.05, attack: 0.05, vibrato: [14, 40] });
    s.tone({ type: 'sine', from: 1100, to: 700, dur: 0.6, gain: 0.09, at: 0.3, vibrato: [9, 60] });
    s.tone({ type: 'sine', from: 760, to: 1500, dur: 0.4, gain: 0.05, attack: 0.08 });
    s.noise({ filter: 'bandpass', from: 3000, to: 1200, q: 3, dur: 0.7, gain: 0.12, attack: 0.1 });
  },
  'ghost-moan': (s) => {
    s.tone({ type: 'sine', from: 300, to: 430, dur: 0.8, gain: 0.1, attack: 0.3, vibrato: [6, 9] });
    s.tone({ type: 'sine', from: 430, to: 250, dur: 0.9, gain: 0.1, at: 0.75, vibrato: [6, 9] });
    s.tone({ type: 'sine', from: 450, to: 640, dur: 0.8, gain: 0.035, attack: 0.3 });
  },
};
