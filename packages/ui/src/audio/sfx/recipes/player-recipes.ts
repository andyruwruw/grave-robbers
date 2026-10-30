// Types
import type { SfxRecipe, PlayerSfx } from '../../../types/sfx';

/**
 * Recipes for the sounds players make.
 */
export const PLAYER_RECIPES: Record<PlayerSfx, SfxRecipe> = {
  'swing': (s) => s.noise({ filter: 'bandpass', from: 700, to: 2600, q: 2, dur: 0.14, gain: 0.9, attack: 0.03 }),
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
  'shadow-step': (s) => {
    s.noise({ filter: 'lowpass', from: 250, to: 1400, dur: 0.32, gain: 0.32, attack: 0.18 });
    s.noise({ filter: 'bandpass', from: 1100, to: 180, q: 0.8, dur: 0.75, gain: 0.34, at: 0.22, attack: 0.08 });
    s.tone({ type: 'sine', from: 92, to: 48, dur: 0.7, gain: 0.14, at: 0.1 });
    s.noise({ filter: 'highpass', from: 3200, to: 1800, dur: 0.5, gain: 0.06, at: 0.25 });
  },
  'whip-crack': (s) => {
    s.noise({ filter: 'highpass', from: 3200, dur: 0.03, gain: 1 });
    s.noise({ filter: 'highpass', from: 4500, dur: 0.015, gain: 0.8, at: 0.035 });
    s.noise({ filter: 'bandpass', from: 2400, to: 800, q: 1.5, dur: 0.12, gain: 0.55, at: 0.004 });
    s.tone({ type: 'square', from: 2800, to: 600, dur: 0.035, gain: 0.12 });
    s.noise({ filter: 'lowpass', from: 1100, dur: 0.18, gain: 0.25, at: 0.02 });
  },
  'gunshot': (s) => {
    s.noise({ filter: 'highpass', from: 1800, dur: 0.05, gain: 0.9 });
    s.noise({ filter: 'lowpass', from: 2600, to: 120, dur: 0.6, gain: 0.9, at: 0.005 });
    s.tone({ type: 'sine', from: 140, to: 32, dur: 0.45, gain: 0.55 });
    s.tone({ type: 'square', from: 90, to: 40, dur: 0.12, gain: 0.18 });
    s.noise({ filter: 'bandpass', from: 700, to: 200, q: 0.8, dur: 0.9, gain: 0.3, at: 0.08 });
  },
  'drink': (s) => {
    for (const at of [0, 0.16, 0.32]) {
      s.tone({ type: 'sine', from: 180, to: 420, dur: 0.1, gain: 0.12, at });
      s.noise({ filter: 'lowpass', from: 700, to: 300, dur: 0.08, gain: 0.25, at: at + 0.02 });
    }
    s.tone({ type: 'triangle', from: 660, to: 990, dur: 0.2, gain: 0.08, at: 0.5 });
  },
  'death': (s) => {
    s.tone({ from: 420, to: 60, dur: 0.85, gain: 0.22 });
    s.tone({ from: 315, to: 46, dur: 0.85, gain: 0.16, at: 0.04 });
  },
  'respawn': (s) => {
    [523, 659, 784, 1046].forEach((f: number, i: number): void => s.tone({ type: 'sine', from: f, dur: 0.12, gain: 0.14, at: i * 0.08 }));
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
};
